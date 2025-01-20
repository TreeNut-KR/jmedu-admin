import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { adminLog, checkPermission, pool } from "@/utils/server";

export default async function deleteStudent(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkPermission("http", "student_delete", req, res);

    // 학생 삭제 시작
    adminLog(`학생 삭제 (student_pk: "${req.query.pk}")`, req);

    const db = pool;

    const [preResults] = await db.query<
      (RowDataPacket & Pick<API.Student, "student_pk" | "deleted_at">)[]
    >(
      `SELECT 
        student_pk,
        deleted_at
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

    const [getResults] = await db.query<(RowDataPacket & API.Student)[]>(
      `SELECT 
        student.*, 
        DATE_FORMAT(student.birthday, '%Y-%m-%d') AS birthday, 
        DATE_FORMAT(student.firstreg, '%Y-%m-%d') as firstreg,
        IF(
          school.school_pk IS NOT NULL, 
          JSON_OBJECT('name', school.name, 'deleted_at', school.deleted_at), 
          NULL
        ) as schoolObj,
        IF(
          COUNT(student_subject.subject_id) = 0,
          JSON_ARRAY(),
          JSON_ARRAYAGG(student_subject.subject_id)
        ) as subjects
      FROM student
      LEFT JOIN school ON student.school = school.school_pk
      LEFT JOIN 
          student_subject ON student.student_pk = student_subject.student_id
          AND student_subject.student_subject_pk IS NOT NULL
          AND student_subject.deleted_at IS NULL
      WHERE student.deleted_at IS NOT NULL AND student.student_pk = ?`,
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
      message: `'${getResults[0].name}' 학생을 삭제했어요.`,
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
