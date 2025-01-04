import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { adminLog, checkAuthenticated, pool } from "@/utils/server";
import { UpdateStudentSubjectsSchema } from "@/schema";

export default async function updateStudentSubjects(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkAuthenticated("student_subjects_edit", req, res);

    // 필요한 쿼리
    const { data: body, error: bodyError } = UpdateStudentSubjectsSchema.safeParse(req.body);

    if (!body) {
      return res.status(400).json({
        success: false,
        message: bodyError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 학생 수강 과목 정보 수정 시작
    adminLog(`학생 수강 과목 정보 수정 (student_pk: "${req.query.pk}")`, req);

    const db = pool;

    const studentInfoQuery = `
      SELECT 
        student.*, 
        DATE_FORMAT(student.birthday, '%Y-%m-%d') AS birthday, 
        DATE_FORMAT(student.firstreg, '%Y-%m-%d') as firstreg,
        IF(
          school.school_pk IS NOT NULL, 
          JSON_OBJECT('name', school.name, 'deleted_at', school.deleted_at), 
          NULL
        ) as schoolObj,
        IF(
          COUNT(student_subject.student_subject_pk) = 0,
          JSON_ARRAY(),
          JSON_ARRAYAGG(
            IF(
              student_subject.student_subject_pk IS NOT NULL, 
              JSON_OBJECT(
                'student_subject_pk', student_subject.student_subject_pk,
                'student_id', student_subject.student_id,
                'subject_id', student_subject.subject_id,
                'created_at', student_subject.created_at,
                'updated_at', student_subject.updated_at,
                'deleted_at', student_subject.deleted_at,
                'subjectObj', IF(
                  subject.subject_pk IS NOT NULL,
                  JSON_OBJECT(
                    'subject_pk', subject.subject_pk,
                    'name', subject.name,
                    'teacher', subject.teacher,
                    'school', subject.school,
                    'grade', subject.grade,
                    'is_personal', subject.is_personal,
                    'created_at', subject.created_at,
                    'updated_at', subject.updated_at,
                    'deleted_at', subject.deleted_at
                  ),
                  NULL
                )
              ), 
              NULL
            )
          )
        ) as studentSubjectArray
      FROM student
      LEFT JOIN school ON student.school = school.school_pk
            LEFT JOIN 
          student_subject ON student.student_pk = student_subject.student_id
      LEFT JOIN 
          subject ON student_subject.student_subject_pk = subject.subject_pk
      WHERE student.is_enable = 1 AND student.student_pk = ? AND student.deleted_at IS NULL
      GROUP BY student.student_pk;
    `;

    const [studentInfoResults] = await db.query<(RowDataPacket & API.Student)[]>(studentInfoQuery, [
      req.query.pk,
    ]);

    if (studentInfoResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "수강 정보를 수정할 학생를 찾을 수 없어요.",
      });
    }

    if (studentInfoResults.length > 1) {
      return res.status(409).json({
        success: false,
        message: "중복된 student_pk를 가진 학생이 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    const deleteQuery = `
      UPDATE student_subject
      SET
        deleted_at = NOW()
      WHERE subject_id = ? AND student_id = ?;
    `;

    for (const subject_id of body.removed_subjects) {
      const [deleteResults] = await db.query<ResultSetHeader>(deleteQuery, [
        subject_id,
        req.query.pk,
      ]);

      // 삭제된 열(학생 수강 과목 정보)이 1개 이상인경우
      if (deleteResults.affectedRows > 1) {
        return res.status(409).json({
          success: false,
          message: "학생 수강 과목 정보 삭제가 중복으로 발생했어요. 서버 관리자에게 문의해주세요.",
        });
      }
    }

    const findQuery = `
      SELECT *
      FROM student_subject
      WHERE subject_id = ? AND student_id = ?;
    `;

    const restoreQuery = `
      UPDATE student_subject
      SET deleted_at = NULL
      WHERE subject_id = ? AND student_id = ?;
    `;

    const addQuery = `
      INSERT INTO student_subject (
        subject_id, student_id, created_at
      ) VALUES (
        ?, ?, NOW()
      )
    `;

    for (const subject_id of body.added_subjects) {
      const [findResults] = await db.query<(RowDataPacket & API.StudentSubject)[]>(findQuery, [
        subject_id,
        req.query.pk,
      ]);

      if (findResults.length > 1) {
        return res.status(409).json({
          success: false,
          message: "중복된 학생 수강 과목 정보가 있어요. 서버 관리자에게 문의해주세요.",
        });
      }

      if (findResults.length === 1) {
        const [restoreResults] = await db.query<ResultSetHeader>(restoreQuery, [
          subject_id,
          req.query.pk,
        ]);

        // 복구된 열(학생 수강 과목 정보)이 1개 이상인경우
        if (restoreResults.affectedRows > 1) {
          return res.status(409).json({
            success: false,
            message:
              "학생 수강 과목 정보 복구가 중복으로 발생했어요. 서버 관리자에게 문의해주세요.",
          });
        }

        break;
      }

      const [addResults] = await db.query<ResultSetHeader>(addQuery, [subject_id, req.query.pk]);

      // 생성된 열(학생 수강 과목 정보)이 1개 이상인경우
      if (addResults.affectedRows > 1) {
        return res.status(409).json({
          success: false,
          message: "학생 수강 과목 정보 생성이 중복으로 발생했어요. 서버 관리자에게 문의해주세요.",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `학생 '${studentInfoResults[0].name}'의 수강 과목 정보를 수정했어요.`,
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message:
        "학생 수강 과목 정보 수정 중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
