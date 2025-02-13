import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { adminLog, checkPermission, pool } from "@/utils/server";
import { HomeworkSchema } from "@/schema";

export default async function updateHomework(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkPermission("http", "homework_edit", req, res);

    // 필요한 쿼리
    const { data: body, error: bodyError } = HomeworkSchema.safeParse(req.body);

    if (!body) {
      return res.status(400).json({
        success: false,
        message: bodyError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 과제 수정 시작
    adminLog(`과제 수정 (homework_pk: "${req.query.pk}")`, req);

    const db = pool;

    const updateQuery = `
      UPDATE homework 
      SET 
        subject_id = ?, 
        title = ?, 
        description = ?, 
        due_date = ?,
        updated_at = NOW() 
      WHERE homework_pk = ?
    `;

    const getQuery = `
      SELECT 
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
      WHERE 
        homework.deleted_at IS NULL 
        AND homework.homework_pk = ?
      GROUP BY homework.homework_pk;
    `;

    // 수정할 과제가 있는지 확인
    const [preResults] = await db.query<(RowDataPacket & API.Homework)[]>(getQuery, [req.query.pk]);

    // 수정할 과제를 찾을 수 없는 경우
    if (preResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "수정할 과제를 찾을 수 없어요.",
      });
    }

    if (preResults.length > 1) {
      return res.status(409).json({
        success: false,
        message: "중복된 homework_pk를 가진 과제가 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    const [updateResults] = await db.query<ResultSetHeader>(updateQuery, [
      body.subject_id,
      body.title,
      body.description,
      body.due_date,
      req.query.pk,
    ]);

    // 업데이트된 열(과제)이 1개 이상인경우
    if (updateResults.affectedRows > 1) {
      return res.status(409).json({
        success: false,
        message: "중복으로 업데이트가 발생했어요. 서버 관리자에게 문의해주세요.",
      });
    }

    // 학생 과제 정보 업데이트
    const removedStudents = preResults[0].students.filter(
      (el) => !body.students.find((el2) => el2 === el),
    );
    const addedStudents = body.students.filter(
      (el) => !preResults[0].students.find((el2) => el2 === el),
    );

    if (removedStudents.length || addedStudents.length) {
      // 학생 과제 정보 수정 시작
      adminLog(`학생 과제 정보 수정 (homework_pk: "${req.query.pk}")`, req);

      const deleteQuery = `
        UPDATE student_homework
        SET
          deleted_at = NOW()
        WHERE student_id = ? AND homework_id = ?;
      `;

      for (const studentId of removedStudents) {
        const [deleteResults] = await db.query<ResultSetHeader>(deleteQuery, [
          studentId,
          req.query.pk,
        ]);

        // 삭제된 열(학생 과제 정보)이 1개 이상인경우
        if (deleteResults.affectedRows > 1) {
          return res.status(409).json({
            success: false,
            message: "학생 과제 정보 삭제가 중복으로 발생했어요. 서버 관리자에게 문의해주세요.",
          });
        }
      }

      const findQuery = `
        SELECT *
        FROM student_homework
        WHERE student_id = ? AND homework_id = ?;
      `;

      const restoreQuery = `
        UPDATE student_homework
        SET deleted_at = NULL
        WHERE student_id = ? AND homework_id = ?;
      `;

      const addQuery = `
        INSERT INTO student_homework (
          student_id, homework_id, created_at
        ) VALUES (
          ?, ?, NOW()
        )
      `;

      for (const studentId of addedStudents) {
        const [findResults] = await db.query<(RowDataPacket & API.StudentHomework)[]>(findQuery, [
          studentId,
          req.query.pk,
        ]);

        if (findResults.length > 1) {
          return res.status(409).json({
            success: false,
            message: "중복된 학생 과제 정보가 있어요. 서버 관리자에게 문의해주세요.",
          });
        }

        if (findResults.length === 1) {
          const [restoreResults] = await db.query<ResultSetHeader>(restoreQuery, [
            studentId,
            req.query.pk,
          ]);

          // 복구된 열(학생 과제 정보)이 1개 이상인경우
          if (restoreResults.affectedRows > 1) {
            return res.status(409).json({
              success: false,
              message: "학생 과제 정보 복구가 중복으로 발생했어요. 서버 관리자에게 문의해주세요.",
            });
          }
        } else {
          const [addResults] = await db.query<ResultSetHeader>(addQuery, [studentId, req.query.pk]);

          // 생성된 열(학생 과제 정보)이 1개 이상인경우
          if (addResults.affectedRows > 1) {
            return res.status(409).json({
              success: false,
              message: "학생 과제 정보 생성이 중복으로 발생했어요. 서버 관리자에게 문의해주세요.",
            });
          }
        }
      }
    }

    const [getResults] = await db.query<(RowDataPacket & API.Homework)[]>(getQuery, [req.query.pk]);

    // 업데이트된 과제를 찾을 수 없는 경우
    if (getResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "업데이트된 과제를 찾을 수 없어요. 서버 관리자에게 문의해주세요.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `과제 '${getResults[0].title}'의 정보를 수정했어요.`,
      data: getResults[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "과제 업데이트중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
