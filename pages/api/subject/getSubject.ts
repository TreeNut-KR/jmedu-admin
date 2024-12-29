import { RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { customErrorMap } from "@/utils";
import { adminLog, checkAuthenticated, pool } from "@/utils/server";
import { GetSubjectSchema } from "@/schema";

export default async function getSubject(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkAuthenticated("subject_view", req, res);

    // 필요한 쿼리
    const { data: params, error: paramsError } = GetSubjectSchema.safeParse(req.query, {
      errorMap: customErrorMap,
    });

    if (!params) {
      return res.status(400).json({
        success: false,
        message: paramsError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 과목 조회 시작
    adminLog(`과목 조회 (subject_pk: ${req.query.pk})`, req);

    const db = pool;

    const whereClause = ["subject_pk = ?"];

    if (!params.includeDeleted) {
      whereClause.push("deleted_at IS NULL");
    }

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
      WHERE ${whereClause.map((el) => `subject.${el}`).join(" AND ")};
    `;

    const [results] = await db.query<(RowDataPacket & API.Subject)[]>(query, [req.query.pk]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "해당 과목를 찾을 수 없어요.",
      });
    }

    if (results.length > 1) {
      return res.status(409).json({
        success: false,
        message: "중복된 subject_pk를 가진 과목가 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    if (results[0].deleted_at) {
      return res.status(200).json({
        success: false,
        message: "삭제된 과목이에요.",
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
      message: "과목 조회중 서버에서 오류가 발생했어요. 관리자에게 문의해주세요.",
    });
  }
}
