import { RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { adminLog, checkPermission, paramsToString, pool } from "@/utils/server";
import { GetTeachersSchema } from "@/schema";

export default async function getTeachers(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkPermission("http", "teachers_view", req, res);

    // 필요한 쿼리
    const { data: params, error: paramsError } = GetTeachersSchema.safeParse(req.query);

    if (!params) {
      return res.status(400).json({
        success: false,
        message: paramsError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 교직원 목록 조회 시작
    adminLog(`교직원 목록 조회 (${paramsToString(params)})`, req);

    const db = pool;

    const whereConditions = ["1=1"];

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
        teacher_pk,
        name,
        sex,
        contact,
        admin_level,
        created_at,
        updated_at,
        deleted_at,
        DATE_FORMAT(birthday, '%Y-%m-%d') AS birthday
      FROM teacher
      WHERE ${whereConditions.join(" AND ")}
      ORDER BY ${params.sort} ${params.order.toUpperCase()}
      ${limitClause}
      ${offsetClause};
    `;

    const metaQuery = `
      SELECT count(*) AS count
      FROM teacher
      WHERE ${whereConditions.join(" AND ")}
    `;

    const [results] = await db.query<(RowDataPacket & API.Teacher)[]>(query);
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
      message: "교직원 목록 조회중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
