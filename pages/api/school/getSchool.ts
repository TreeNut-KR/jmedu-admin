import { RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { customErrorMap } from "@/utils";
import { adminLog, checkPermission, pool } from "@/utils/server";
import { GetSchoolSchema } from "@/schema";

export default async function getSchool(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkPermission("http", "school_view", req, res);

    // 필요한 쿼리
    const { data: params, error: paramsError } = GetSchoolSchema.safeParse(req.query, {
      errorMap: customErrorMap,
    });

    if (!params) {
      return res.status(400).json({
        success: false,
        message: paramsError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 학교 조회 시작
    adminLog(`학교 조회 (school_pk: ${req.query.pk})`, req);

    const db = pool;

    const whereClause = ["school_pk = ?"];

    if (!params.includeDefault) {
      whereClause.push("school_pk != 0");
      whereClause.push("name != '학교 미설정'");
      whereClause.push("name != '학교 미지정'");
    }

    if (!params.includeDeleted) {
      whereClause.push("deleted_at IS NULL");
    }

    const query = `
      SELECT *
      FROM school
      WHERE ${whereClause.join(" AND ")};
    `;

    const [results] = await db.query<(RowDataPacket & API.School)[]>(query, [req.query.pk]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "해당 학교를 찾을 수 없어요.",
      });
    }

    if (results.length > 1) {
      return res.status(409).json({
        success: false,
        message: "중복된 school_pk를 가진 학교가 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    if (
      results[0].school_pk === 0 ||
      results[0].name === "학교 미설정" ||
      results[0].name === "학교 미지정"
    ) {
      return res.status(200).json({
        success: false,
        message: "기본값으로 사용되는 학교에요.",
        data: results[0],
      });
    }

    if (results[0].deleted_at) {
      return res.status(200).json({
        success: false,
        message: "삭제된 학교에요.",
        data: results[0],
      });
    }

    return res.status(200).json({
      success: true,
      data: results[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "학교 조회중 서버에서 오류가 발생했어요. 관리자에게 문의해주세요.",
    });
  }
}
