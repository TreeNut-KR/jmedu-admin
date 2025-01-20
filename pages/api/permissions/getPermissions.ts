import { RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { adminLog, checkPermission, pool } from "@/utils/server";

export default async function getPermissions(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkPermission("http", "permissions_view", req, res);

    // 권한 목록 조회 시작
    adminLog("관리자 권한 목록 조회", req);

    const db = pool;

    const query = `
      SELECT *
      FROM permissions
      WHERE deleted_at IS NULL;
    `;

    const [results] = await db.query<(RowDataPacket & API.Permission)[]>(query);

    return res.status(200).json({
      success: true,
      data: results,
      meta: { total: results.length },
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "권한 목록 조회중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
