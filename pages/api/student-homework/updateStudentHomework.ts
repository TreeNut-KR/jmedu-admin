import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { adminLog, checkPermission, pool } from "@/utils/server";
import { StudentHomeworkSchema } from "@/schema";

export default async function updateStudentHomework(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkPermission("http", "homework_edit", req, res);

    // 필요한 쿼리
    const { data: body, error: bodyError } = StudentHomeworkSchema.safeParse(req.body);

    if (!body) {
      return res.status(400).json({
        success: false,
        message: bodyError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 학생 과제 정보 수정 시작
    adminLog(`학생 과제 정보 수정 (student_homework_pk: ${req.query.pk})`, req);

    const db = pool;

    const updateQuery = `
      UPDATE student_homework
      SET 
        submitted_at = ?, 
        remarks = ?,
        updated_at = NOW() 
      WHERE deleted_at IS NULL AND student_homework_pk = ?
    `;

    const getQuery = `
      SELECT 
        student_homework.*,
        DATE_FORMAT(student_homework.submitted_at, '%Y-%m-%dT%H:%i:%s') AS submitted_at,
        IF(
          student.student_pk IS NOT NULL, 
          JSON_OBJECT('name', student.name, 'deleted_at', student.deleted_at), 
          NULL
        ) as studentObj
      FROM student_homework
      LEFT JOIN student ON student_homework.student_id = student.student_pk
      WHERE student_homework.student_homework_pk = ?
    `;

    // 수정할 학생 과제 정보가 존재하는지 확인
    const [preResults] = await db.query<(RowDataPacket & API.StudentHomework)[]>(getQuery, [
      req.query.pk,
    ]);

    // 수정할 학생 과제 정보가 존재하지 않는 경우
    if (preResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "수정할 학생 과제 정보를 찾을 수 없어요.",
      });
    }

    if (preResults.length > 1) {
      return res.status(409).json({
        success: false,
        message: "중복된 pk를 가진 학생 과제 정보가 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    if (preResults[0].deleted_at) {
      return res.status(404).json({
        success: false,
        message: "이미 삭제된 학생 과제 정보는 수정할 수 없어요.",
      });
    }

    const [updateResults] = await db.query<ResultSetHeader>(updateQuery, [
      body.submitted_at,
      body.remarks,
      req.query.pk,
    ]);

    const [getResults] = await db.query<(RowDataPacket & API.StudentHomework)[]>(getQuery, [
      req.query.pk,
    ]);

    // 업데이트된 열(학생 과제 정보)이 1개 이상인경우
    if (updateResults.affectedRows > 1) {
      return res.status(409).json({
        success: false,
        message: "중복으로 수정이 발생했어요. 서버 관리자에게 문의해주세요.",
      });
    }

    // 업데이트된 학생 과제 정보를 찾을 수 없는 경우
    if (getResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "수정된 학생 과제 정보를 찾을 수 없어요. 서버 관리자에게 문의해주세요.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `'${getResults[0].studentObj?.name}' 학생의 과제 정보를 수정했어요.`,
      data: getResults[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "학생 과제 정보 수정중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
