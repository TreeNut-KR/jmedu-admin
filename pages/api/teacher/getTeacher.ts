import { RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { customErrorMap } from "@/utils";
import { adminLog, checkAuthenticated, pool } from "@/utils/server";
import { GetTeacherSchema } from "@/schema";

export default async function getTeacher(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkAuthenticated("teacher_view", req, res);

    // 필요한 쿼리
    const { data: params, error: paramsError } = GetTeacherSchema.safeParse(req.query, {
      errorMap: customErrorMap,
    });

    if (!params) {
      return res.status(400).json({
        success: false,
        message: paramsError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 교직원 조회 시작
    adminLog(`교직원 조회 (teacher_pk: "${req.query.pk}")`, req);

    const db = pool;

    const whereConditions = ["teacher_pk = ?"];

    if (!params.includeDeleted) {
      whereConditions.push("deleted_at IS NULL");
    }

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
      WHERE ${whereConditions.join(" AND ")};
    `;

    const [results] = await db.query<(RowDataPacket & API.Teacher)[]>(query, [req.query.pk]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "해당 교직원을 찾을 수 없어요.",
      });
    }

    if (results.length > 1) {
      return res.status(409).json({
        success: false,
        message: "중복된 teacher_pk를 가진 교직원이 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    if (results[0].deleted_at) {
      return res.status(200).json({
        success: false,
        message: "삭제된 교직원이에요.",
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
      message: "교직원 조회중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
