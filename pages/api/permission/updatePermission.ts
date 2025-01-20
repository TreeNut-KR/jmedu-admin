import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { adminLog, checkPermission, pool } from "@/utils/server";
import { PermissionSchema } from "@/schema";

export default async function updatePermission(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkPermission("http", "permission_edit", req, res);

    // 필요한 쿼리
    const { data: body, error: bodyError } = PermissionSchema.safeParse(req.body);

    if (!body) {
      return res.status(400).json({
        success: false,
        message: bodyError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 관리자 권한 레벨 수정 시작
    adminLog(`관리자 권한 레벨 수정 (task_name: "${req.query.name}")`, req);

    if (req.query.name === "permissions_view") {
      return res.status(404).json({
        success: false,
        message: "해당 권한은 수정할 수 없어요.",
      });
    }

    const db = pool;

    const updateQuery = `
      UPDATE permissions 
      SET 
        level = ?,
        updated_at = NOW()
      WHERE task_name = ?
    `;

    const getQuery = `
      SELECT *
      FROM permissions
      WHERE deleted_at IS NULL AND task_name = ?
    `;

    const [updateResults] = await db.query<ResultSetHeader>(updateQuery, [
      body.level,
      req.query.name,
    ]);

    const [getResults] = await db.query<(RowDataPacket & API.Permission)[]>(getQuery, [
      req.query.name,
    ]);

    // 업데이트된 열(권한)이 1개 이상인경우
    if (updateResults.affectedRows > 1) {
      return res.status(409).json({
        success: false,
        message: "중복으로 업데이트가 발생했어요. 서버 관리자에게 문의해주세요.",
      });
    }

    // 업데이트된 권한을 찾을 수 없는 경우
    if (getResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "업데이트된 권한을 찾을 수 없어요. 서버 관리자에게 문의해주세요.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `권한 '${getResults[0].task_name}'을(를) 수정했어요.`,
      data: getResults[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "권한 수정중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
