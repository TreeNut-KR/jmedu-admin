import { RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import { checkAuthenticated, pool } from "@/utils/server";
import { GetAdminLogSchema } from "@/schema";

export default async function getAdminLog(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkAuthenticated("admin_log_view", req, res);

    // 필요한 쿼리
    const { data: params, error: paramsError } = GetAdminLogSchema.safeParse(req.query);

    if (!params) {
      return res.status(400).json({
        success: false,
        message: paramsError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 작업 기록 조회 시작
    // adminLog(`작업 기록 조회 (${paramsToString(params)})`, req);

    const db = pool;

    let whereClause = "WHERE 0=0";

    if (params.filter && params.search) {
      whereClause += ` AND ${params.filter} LIKE '${params.search}'`;
    }

    const limitClause = params.limit > 0 ? `LIMIT ${params.limit}` : ``;

    const offsetClause = params.limit > 0 ? `OFFSET ${(params.page - 1) * params.limit}` : ``;

    const query = `
      SELECT *
      FROM admin_log
      ${whereClause}
      ORDER BY ${params.sort} ${params.order.toUpperCase()}
      ${limitClause}
      ${offsetClause}
    `;

    const metaQuery = `
      SELECT count(*) AS count
      FROM admin_log
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
      message: "작업 기록 조회중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
