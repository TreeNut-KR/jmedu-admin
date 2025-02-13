import { josa } from "es-hangul";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { adminLog, checkPermission, pool } from "@/utils/server";
import { HomeworkSchema } from "@/schema";

export default async function createHomework(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkPermission("http", "homework_add", req, res);

    // 필요한 쿼리
    const { data: body, error: bodyError } = HomeworkSchema.safeParse(req.body);

    if (!body) {
      return res.status(400).json({
        success: false,
        message: bodyError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 과제 생성 시작
    adminLog(`과제 생성 (title: "${body.title}")`, req);

    const db = pool;

    const createQuery = `
      INSERT INTO homework (
        subject_id, title, description, due_date, created_at, updated_at, deleted_at
      ) VALUES (
        ?, ?, ?, ?, NOW(), NOW(), null
      )
    `;

    const saveLastIdQuery = `SET @last_insert_homework_id = LAST_INSERT_ID();`;

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
        AND homework.homework_pk = @last_insert_homework_id
      GROUP BY homework.homework_pk;
    `;

    const createStudentHomeworkQuery = `
      INSERT INTO student_homework (
        homework_id, student_id, created_at, updated_at
      ) VALUES (
        @last_insert_homework_id, ?, NOW(), NOW()
      )
    `;

    await db.query<ResultSetHeader>(createQuery, [
      body.subject_id,
      body.title,
      body.description,
      body.due_date,
    ]);

    await db.query<ResultSetHeader>(saveLastIdQuery);

    // 학생 과제 생성
    for (const studentId of body.students) {
      const [createResults] = await db.query<ResultSetHeader>(createStudentHomeworkQuery, [
        studentId,
      ]);

      // 생성된 열(학생 과제)이 1개 이상인경우
      if (createResults.affectedRows > 1) {
        return res.status(409).json({
          success: false,
          message: "학생 과제 생성이 중복으로 발생했어요. 서버 관리자에게 문의해주세요.",
        });
      }
    }

    const [getResults] = await db.query<(RowDataPacket & API.Homework)[]>(getQuery);

    // 생성된 과제를 찾을 수 없는 경우
    if (getResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "생성된 과제를 찾을 수 없어요. 서버 관리자에게 문의해주세요.",
      });
    }

    // 생성된 과제와 같은 homework_pk를 가진 학생이 존재하는 경우
    if (getResults.length > 1) {
      return res.status(409).json({
        success: false,
        message: "생성된 과제와 같은 pk를 가진 과제가 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    return res.status(201).json({
      success: true,
      message: `과제 '${getResults[0].title}'${josa.pick(getResults[0].title ?? "", "을/를")} 생성했어요.`,
      data: getResults[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "과제 생성중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
