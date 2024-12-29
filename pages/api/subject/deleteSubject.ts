import { josa } from "es-hangul";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { adminLog, checkAuthenticated, pool } from "@/utils/server";

export default async function deleteSubject(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkAuthenticated("subject_delete", req, res);

    // 과목 삭제 시작
    adminLog(`과목 삭제 (subject_pk: ${req.query.pk})`, req);

    const db = pool;

    const preQuery = `
      SELECT 
        subject_pk,
        deleted_at
      FROM subject
      WHERE subject_pk = ?
    `;

    const deleteQuery = `
      UPDATE subject 
      SET deleted_at = NOW() 
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
      WHERE subject.deleted_at IS NOT NULL AND subject.subject_pk = ?
    `;

    // 삭제할 과목이 존재하는지 확인
    const [preResults] = await db.query<
      (RowDataPacket & Pick<API.Subject, "subject_pk" | "deleted_at">)[]
    >(preQuery, [req.query.pk]);

    // 삭제할 과목이 존재하지 않는 경우
    if (preResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "삭제할 과목을 찾을 수 없어요.",
      });
    }

    if (preResults.length > 1) {
      return res.status(409).json({
        success: false,
        message: "중복된 suject_pk를 가진 과목이 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    if (preResults[0].deleted_at) {
      return res.status(404).json({
        success: false,
        message: "이미 삭제된 과목은 삭제할 수 없어요.",
      });
    }

    const [deleteResults] = await db.query<ResultSetHeader>(deleteQuery, [req.query.pk]);

    const [getResults] = await db.query<(RowDataPacket & API.Subject)[]>(getQuery, [req.query.pk]);

    // 삭제된 열(과목)이 1개 이상인경우
    if (deleteResults.affectedRows > 1) {
      return res.status(409).json({
        success: false,
        message: "중복으로 삭제가 발생했어요. 서버 관리자에게 문의해주세요.",
      });
    }

    // 삭제된 과목을 찾을 수 없는 경우
    if (getResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "삭제된 과목을 찾을 수 없어요. 서버 관리자에게 문의해주세요.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `과목 '${getResults[0].name}'${josa.pick(getResults[0].name ?? "", "을/를")} 삭제했어요.`,
      data: getResults[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "과목 삭제중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
