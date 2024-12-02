import { RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import { adminLog, checkAuthenticated, paramsToString, pool } from "@/utils/server";
import { GetSchoolsSchema } from "@/schema";

export default async function getSchools(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkAuthenticated("schools_view", req, res);

    // 필요한 쿼리
    const { data: params, error: paramsError } = GetSchoolsSchema.safeParse(req.query);

    if (!params) {
      return res.status(400).json({
        success: false,
        message: paramsError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 학교 목록 조회 시작
    adminLog(`학교 목록 조회 (${paramsToString(params)})`, req);

    const db = pool;

    const whereConditions = ["1=1"];

    if (!params.includeDefault) {
      whereConditions.push("school_pk != 0");
    }

    if (!params.includeDeleted) {
      whereConditions.push("deleted_at IS NULL");
    }

    let whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    if (params.filter && params.search) {
      whereClause += ` AND ${params.filter} LIKE '${params.search}'`;
    }

    const limitClause = params.limit > 0 ? `LIMIT ${params.limit}` : ``;

    const offsetClause = params.limit > 0 ? `OFFSET ${(params.page - 1) * params.limit}` : ``;

    const query = `
      SELECT *
      FROM school
      ${whereClause}
      ORDER BY ${params.sort} ${params.order.toUpperCase()}
      ${limitClause}
      ${offsetClause}
    `;

    const metaQuery = `
      SELECT count(*) AS count
      FROM school
      ${whereClause}
    `;

    const [results] = await db.query<RowDataPacket[]>(query);
    const [metaResult] = await db.query<RowDataPacket[]>(metaQuery);

    return res.status(200).json({
      success: true,
      data: results,
      meta: { total: metaResult[0].count },
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "학교 목록 조회중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
