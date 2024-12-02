import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import { adminLog, checkAuthenticated, pool } from "@/utils/server";

export default async function deleteStudent(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkAuthenticated("student_delete", req, res);

    // 학생 삭제 시작
    adminLog(`학생 삭제 (student_pk: "${req.query.pk}")`, req);

    const db = pool;

    const [preResults] = await db.query<RowDataPacket[]>(
      `SELECT name
      FROM student
      WHERE student_pk = ?`,
      [req.query.pk],
    );

    if (preResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "삭제할 학생을 찾을 수 없어요.",
      });
    }

    if (preResults.length > 1) {
      return res.status(409).json({
        success: false,
        message: "중복된 student_pk를 가진 학생이 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    if (preResults[0].deleted_at) {
      return res.status(404).json({
        success: false,
        message: "이미 삭제된 학생은 삭제할 수 없어요.",
      });
    }

    const [deleteResults] = await db.query<ResultSetHeader>(
      "UPDATE student SET deleted_at = NOW() WHERE student_pk = ?",
      [req.query.pk],
    );

    const [getResults] = await db.query<RowDataPacket[]>(
      `SELECT
        *,
        DATE_FORMAT(birthday, '%Y-%m-%d') AS birthday,
        DATE_FORMAT(firstreg, '%Y-%m-%d') as firstreg
      FROM student
      WHERE deleted_at IS NOT NULL AND student_pk = ?`,
      [req.query.pk],
    );

    // 삭제된 열(학생)이 1개 이상인경우
    if (deleteResults.affectedRows > 1) {
      return res.status(409).json({
        success: false,
        message: "중복으로 삭제가 발생했어요. 서버 관리자에게 문의해주세요.",
      });
    }

    // 삭제된 학생을 찾을 수 없는 경우
    if (getResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "삭제된 학생를 찾을 수 없어요. 서버 관리자에게 문의해주세요.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `'${preResults[0].name}' 학생을 삭제했어요.`,
      data: getResults[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "학생 삭제중 서버에서 오류가 발생하였습니다.",
    });
  }
}
