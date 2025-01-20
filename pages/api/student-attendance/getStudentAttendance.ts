import { RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { adminLog, checkPermission, paramsToString, pool } from "@/utils/server";
import { GetStudentAttendanceSchema } from "@/schema";

export default async function getStudentAttendance(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkPermission("http", "students_attendance_view", req, res);

    // 필요한 쿼리
    const { data: params, error: paramsError } = GetStudentAttendanceSchema.safeParse(req.query);

    if (!params) {
      return res.status(400).json({
        success: false,
        message: paramsError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 학생 출결 기록 조회 시작
    adminLog(`학생 출결 기록 조회 (${paramsToString(params)})`, req);

    const db = pool;

    const whereConditions = ["attendance_log_pk IS NOT NULL"];

    if (params.filter && params.search) {
      whereConditions.push(`${params.filter} LIKE '${params.search}'`);
    }

    const limitClause = params.limit > 0 ? `LIMIT ${params.limit}` : ``;

    const offsetClause = params.limit > 0 ? `OFFSET ${(params.page - 1) * params.limit}` : ``;

    const query = `
      SELECT 
        attendance_log.*,
        IF(
          student.student_pk IS NOT NULL, 
          JSON_OBJECT('name', student.name, 'deleted_at', student.deleted_at), 
          NULL
        ) as studentObj
      FROM attendance_log
      LEFT JOIN student ON attendance_log.student = student.student_pk
      WHERE ${whereConditions.map((el) => `attendance_log.${el}`).join(" AND ")}
      ORDER BY ${params.sort} ${params.order.toUpperCase()}
      ${limitClause}
      ${offsetClause}
    `;

    const metaQuery = `
      SELECT count(*) AS count
      FROM attendance_log
      WHERE ${whereConditions.join(" AND ")}
    `;

    const [results] = await db.query<(RowDataPacket & API.StudentAttendance)[]>(query);
    const [metaResult] = await db.query<(RowDataPacket & { count: number })[]>(metaQuery);

    return res.status(200).json({
      success: true,
      data: results,
      meta: { total: metaResult[0].count },
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "학생 출결 기록 조회중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
