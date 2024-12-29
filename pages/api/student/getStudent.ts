import { RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { customErrorMap } from "@/utils";
import { adminLog, checkAuthenticated, pool } from "@/utils/server";
import { GetStudentSchema } from "@/schema";

export default async function getStudent(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkAuthenticated("students_view", req, res);

    // 필요한 쿼리
    const { data: params, error: paramsError } = GetStudentSchema.safeParse(req.query, {
      errorMap: customErrorMap,
    });

    if (!params) {
      return res.status(400).json({
        success: false,
        message: paramsError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 학생 조회 시작
    adminLog(`학생 조회 (student_pk: "${req.query.pk}")`, req);

    const db = pool;

    const whereConditions = params.includeDeleted
      ? ["is_enable = 1", "student_pk = ?"]
      : ["is_enable = 1", "student_pk = ?", "deleted_at IS NULL"];

    const query = `
      SELECT 
        student.*, 
        DATE_FORMAT(student.birthday, '%Y-%m-%d') AS birthday, 
        DATE_FORMAT(student.firstreg, '%Y-%m-%d') as firstreg,
        IF(
          school.school_pk IS NOT NULL, 
          JSON_OBJECT('name', school.name, 'deleted_at', school.deleted_at), 
          NULL
        ) as schoolObj
      FROM student
      LEFT JOIN school ON student.school = school.school_pk
      WHERE ${whereConditions.map((el) => `student.${el}`).join(" AND ")};
    `;

    const [results] = await db.query<(RowDataPacket & API.Student)[]>(query, [req.query.pk]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "해당 학생를 찾을 수 없어요.",
      });
    }

    if (results.length > 1) {
      return res.status(409).json({
        success: false,
        message: "중복된 student_pk를 가진 학생이 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    if (results[0].deleted_at) {
      return res.status(200).json({
        success: false,
        message: "삭제된 학생이에요.",
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
      message: "학생 조회중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
