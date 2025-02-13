import { josa } from "es-hangul";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { adminLog, checkPermission, pool } from "@/utils/server";

export default async function deleteHomework(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkPermission("http", "homework_delete", req, res);

    // 과제 삭제 시작
    adminLog(`과제 삭제 (homework_pk: "${req.query.pk}")`, req);

    const db = pool;

    const [preResults] = await db.query<
      (RowDataPacket & Pick<API.Homework, "homework_pk" | "deleted_at">)[]
    >(
      `SELECT 
        homework_pk,
        deleted_at
      FROM homework
      WHERE homework_pk = ?`,
      [req.query.pk],
    );

    if (preResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "삭제할 과제을 찾을 수 없어요.",
      });
    }

    if (preResults.length > 1) {
      return res.status(409).json({
        success: false,
        message: "중복된 homework_pk를 가진 과제가 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    if (preResults[0].deleted_at) {
      return res.status(404).json({
        success: false,
        message: "이미 삭제된 과제는 삭제할 수 없어요.",
      });
    }

    const [deleteResults] = await db.query<ResultSetHeader>(
      "UPDATE homework SET deleted_at = NOW() WHERE homework_pk = ?",
      [req.query.pk],
    );

    const [getResults] = await db.query<(RowDataPacket & API.Homework)[]>(
      `SELECT 
        homework.*,
        DATE_FORMAT(homework.due_date, '%Y-%m-%dT%H:%i:%s') AS due_date,
        IF(
          subject.subject_pk IS NOT NULL, 
          JSON_OBJECT(
            'name', subject.name, 
            'deleted_at', subject.deleted_at
          ), 
          NULL
        ) as subjectObj,
        IF(
          COUNT(student_homework.student_id) = 0,
          JSON_ARRAY(),
          JSON_ARRAYAGG(student_homework.student_id)
        ) as students,
        IF(
          COUNT(student_homework.student_homework_pk) = 0,
          JSON_ARRAY(),
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'student_homework_pk', student_homework.student_homework_pk,
              'homework_id', student_homework.homework_id,
              'student_id', student_homework.student_id,
              'remarks', student_homework.remarks,
              'submitted_at', student_homework.submitted_at,
              'created_at', student_homework.created_at,
              'updated_at', student_homework.updated_at,
              'deleted_at', student_homework.deleted_at,
              'studentObj', IF(
                student.student_pk IS NOT NULL, 
                JSON_OBJECT(
                  'name', student.name, 
                  'deleted_at', student.deleted_at
                ), 
                NULL
              )
            )
          )
        ) as student_homeworks
      FROM homework
      LEFT JOIN subject ON homework.subject_id = subject.subject_pk
      LEFT JOIN 
        student_homework ON homework.homework_pk = student_homework.homework_id
        AND student_homework.student_homework_pk IS NOT NULL
        AND student_homework.deleted_at IS NULL
      LEFT JOIN student ON student_homework.student_id = student.student_pk
      WHERE homework.deleted_at IS NOT NULL AND homework.homework_pk = ?
      GROUP BY homework.homework_pk;
      `,
      [req.query.pk],
    );

    // 삭제된 열(과제)이 1개 이상인경우
    if (deleteResults.affectedRows > 1) {
      return res.status(409).json({
        success: false,
        message: "중복으로 삭제가 발생했어요. 서버 관리자에게 문의해주세요.",
      });
    }

    // 삭제된 과제를 찾을 수 없는 경우
    if (getResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "삭제된 과제를 찾을 수 없어요. 서버 관리자에게 문의해주세요.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `과제 '${getResults[0].title}'${josa.pick(getResults[0].title ?? "", "을/를")} 삭제했어요.`,
      data: getResults[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "과제 삭제중 서버에서 오류가 발생하였습니다.",
    });
  }
}
