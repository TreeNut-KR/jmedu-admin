import { RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { adminLog, checkAuthenticated, paramsToString, pool } from "@/utils/server";
import { GetSubjectsSchema } from "@/schema";

export default async function getSubjects(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkAuthenticated("subjects_view", req, res);

    // 필요한 쿼리
    const { data: params, error: paramsError } = GetSubjectsSchema.safeParse(req.query);

    if (!params) {
      return res.status(400).json({
        success: false,
        message: paramsError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 과목 목록 조회 시작
    adminLog(`과목 목록 조회 (${paramsToString(params)})`, req);

    const db = pool;

    const whereConditions = ["subject_pk IS NOT NULL"];

    if (!params.includeDeleted) {
      whereConditions.push("deleted_at IS NULL");
    }

    if (params.filter && params.search) {
      whereConditions.push(`${params.filter} LIKE '${params.search}'`);
    }

    const limitClause = params.limit > 0 ? `LIMIT ${params.limit}` : ``;

    const offsetClause = params.limit > 0 ? `OFFSET ${(params.page - 1) * params.limit}` : ``;

    const query = `
      SELECT 
        subject.*,
        IF(
          teacher.teacher_pk IS NOT NULL, 
          JSON_OBJECT('name', teacher.name, 'deleted_at', teacher.deleted_at), 
          NULL
        ) as teacherObj,
        IF(
          school.school_pk IS NOT NULL, 
          JSON_OBJECT('name', school.name, 'deleted_at', school.deleted_at), 
          NULL
        ) as schoolObj
      FROM subject
      LEFT JOIN teacher ON subject.teacher = teacher.teacher_pk
      LEFT JOIN school ON subject.school = school.school_pk
      WHERE ${whereConditions.map((el) => `subject.${el}`).join(" AND ")}
      ORDER BY ${params.sort} ${params.order.toUpperCase()}
      ${limitClause}
      ${offsetClause}
    `;

    const metaQuery = `
      SELECT count(*) AS count
      FROM subject
      WHERE ${whereConditions.join(" AND ")}
    `;

    const [results] = await db.query<(RowDataPacket & API.Subject)[]>(query);
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
      message: "과목 목록 조회중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
