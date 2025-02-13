import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { adminLog, checkPermission, pool } from "@/utils/server";
import { StudentSchema } from "@/schema";

export default async function updateStudent(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkPermission("http", "student_edit", req, res);

    // 필요한 쿼리
    const { data: body, error: bodyError } = StudentSchema.safeParse(req.body);

    if (!body) {
      return res.status(400).json({
        success: false,
        message: bodyError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 학생 수정 시작
    adminLog(`학생 수정 (student_pk: "${req.query.pk}")`, req);

    const db = pool;

    const updateQuery = `
      UPDATE student 
      SET 
        name = ?, 
        sex = ?, 
        birthday = ?, 
        contact = ?, 
        contact_parent = ?, 
        school = ?, 
        payday = ?, 
        firstreg = ?, 
        updated_at = NOW() 
      WHERE student_pk = ?
    `;

    const getQuery = `
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
      WHERE 
        student.deleted_at IS NULL 
        AND student.is_enable = 1 
        AND student.student_pk = ?
    `;

    // 수정할 학생이 있는지 확인
    const [preResults] = await db.query<(RowDataPacket & API.Student)[]>(getQuery, [req.query.pk]);

    // 수정할 학생을 찾을 수 없는 경우
    if (preResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "수정할 학생을 찾을 수 없어요.",
      });
    }

    if (preResults.length > 1) {
      return res.status(409).json({
        success: false,
        message: "중복된 student_pk를 가진 학생이 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    const [updateResults] = await db.query<ResultSetHeader>(updateQuery, [
      body.name,
      body.sex,
      body.birthday,
      body.contact,
      body.contact_parent,
      body.school,
      body.payday,
      body.firstreg,
      req.query.pk,
    ]);

    // 업데이트된 열(학생)이 1개 이상인경우
    if (updateResults.affectedRows > 1) {
      return res.status(409).json({
        success: false,
        message: "중복으로 업데이트가 발생했어요. 서버 관리자에게 문의해주세요.",
      });
    }

    // 학생 수강 과목 정보 업데이트
    const isAllow = await checkPermission("boolean", "student_subject_edit", req, res);

    const removedSubjects = preResults[0].subjects.filter(
      (el) => !body.subjects.find((el2) => el2 === el),
    );
    const addedSubjects = body.subjects.filter(
      (el) => !preResults[0].subjects.find((el2) => el2 === el),
    );

    if (isAllow && (removedSubjects.length || addedSubjects.length)) {
      // 학생 수강 과목 정보 수정 시작
      adminLog(`학생 수강 과목 정보 수정 (student_pk: "${req.query.pk}")`, req);

      const deleteQuery = `
        UPDATE student_subject
        SET
          deleted_at = NOW()
        WHERE subject_id = ? AND student_id = ?;
      `;

      for (const subjectId of removedSubjects) {
        const [deleteResults] = await db.query<ResultSetHeader>(deleteQuery, [
          subjectId,
          req.query.pk,
        ]);

        // 삭제된 열(학생 수강 과목 정보)이 1개 이상인경우
        if (deleteResults.affectedRows > 1) {
          return res.status(409).json({
            success: false,
            message:
              "학생 수강 과목 정보 삭제가 중복으로 발생했어요. 서버 관리자에게 문의해주세요.",
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

      for (const subjectId of addedSubjects) {
        const [findResults] = await db.query<(RowDataPacket & API.StudentSubject)[]>(findQuery, [
          subjectId,
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
            subjectId,
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
        } else {
          const [addResults] = await db.query<ResultSetHeader>(addQuery, [subjectId, req.query.pk]);

          // 생성된 열(학생 수강 과목 정보)이 1개 이상인경우
          if (addResults.affectedRows > 1) {
            return res.status(409).json({
              success: false,
              message:
                "학생 수강 과목 정보 생성이 중복으로 발생했어요. 서버 관리자에게 문의해주세요.",
            });
          }
        }
      }
    }

    const [getResults] = await db.query<(RowDataPacket & API.Student)[]>(getQuery, [req.query.pk]);

    // 업데이트된 학생을 찾을 수 없는 경우
    if (getResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "업데이트된 학생를 찾을 수 없어요. 서버 관리자에게 문의해주세요.",
      });
    }

    // 구버전 대응
    if (process.env.OLD_SEX_COLUMN && process.env.OLD_MALE_CODE && process.env.OLD_FEMALE_CODE) {
      const legacyUpdateQuery = `
        UPDATE student 
        SET ${process.env.OLD_SEX_COLUMN} = ?
        WHERE student_pk = ?
      `;

      await db.query<ResultSetHeader>(legacyUpdateQuery, [
        body.sex !== 2 ? Number(process.env.OLD_MALE_CODE) : Number(process.env.OLD_FEMALE_CODE),
        req.query.pk,
      ]);
    }

    return res.status(200).json({
      success: true,
      message: `학생 '${getResults[0].name}'의 정보를 수정했어요.`,
      data: getResults[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "학생 업데이트중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
