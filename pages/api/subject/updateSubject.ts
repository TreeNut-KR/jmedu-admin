import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { adminLog, checkPermission, pool } from "@/utils/server";
import { SubjectSchema } from "@/schema";

export default async function updateSubject(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkPermission("http", "subject_edit", req, res);

    // 필요한 쿼리
    const { data: body, error: bodyError } = SubjectSchema.safeParse(req.body);

    if (!body) {
      return res.status(400).json({
        success: false,
        message: bodyError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 과목 수정 시작
    adminLog(`과목 수정 (subject_pk: ${req.query.pk})`, req);

    const db = pool;

    const updateQuery = `
      UPDATE subject
      SET 
        name = ?, 
        teacher = ?, 
        school = ?, 
        grade = ?, 
        is_personal = ?,
        updated_at = NOW() 
      WHERE deleted_at IS NULL AND subject_pk = ?
    `;

    const getQuery = `
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
      WHERE subject.subject_pk = ?
    `;

    // 수정할 과목이 존재하는지 확인
    const [preResults] = await db.query<(RowDataPacket & API.Subject)[]>(getQuery, [req.query.pk]);

    // 수정할 과목이 존재하지 않는 경우
    if (preResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "수정할 과목을 찾을 수 없어요.",
      });
    }

    if (preResults.length > 1) {
      return res.status(409).json({
        success: false,
        message: "중복된 subject_pk를 가진 과목이 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    if (preResults[0].deleted_at) {
      return res.status(404).json({
        success: false,
        message: "이미 삭제된 과목은 수정할 수 없어요.",
      });
    }

    const [updateResults] = await db.query<ResultSetHeader>(updateQuery, [
      body.name,
      body.teacher,
      body.school,
      body.grade,
      body.is_personal,
      req.query.pk,
    ]);

    const [getResults] = await db.query<RowDataPacket[]>(getQuery, [req.query.pk]);

    // 업데이트된 열(과목)이 1개 이상인경우
    if (updateResults.affectedRows > 1) {
      return res.status(409).json({
        success: false,
        message: "중복으로 수정이가 발생했어요. 서버 관리자에게 문의해주세요.",
      });
    }

    // 업데이트된 과목을 찾을 수 없는 경우
    if (getResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "수정된 과목을 찾을 수 없어요. 서버 관리자에게 문의해주세요.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `과목 '${getResults[0].name}'의 정보를 수정했어요.`,
      data: getResults[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "과목 정보 수정중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
