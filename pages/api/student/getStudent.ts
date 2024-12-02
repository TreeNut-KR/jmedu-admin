import { RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
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

    const whereClause = params.includeDeleted
      ? "WHERE is_enable = 1 AND student_pk = ?"
      : "WHERE deleted_at IS NULL AND is_enable = 1 AND student_pk = ?";

    const query = `
      SELECT 
        *, 
        DATE_FORMAT(birthday, '%Y-%m-%d') AS birthday, 
        DATE_FORMAT(firstreg, '%Y-%m-%d') as firstreg
      FROM student
      ${whereClause};
    `;

    const [results] = await db.query<RowDataPacket[]>(query, [req.query.pk]);

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
