import { JWTPayload } from "jose";
import { RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { customErrorMap } from "@/utils";
import { adminLog, checkPermission, decrypt, paramsToString, pool } from "@/utils/server";
import { GetStudentHomeworkSchema } from "@/schema";

export default async function getStudentHomework(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkPermission("http", "student_homework_view", req, res);

    // 필요한 쿼리
    const { data: params, error: paramsError } = GetStudentHomeworkSchema.safeParse(req.query, {
      errorMap: customErrorMap,
    });

    if (!params) {
      return res.status(400).json({
        success: false,
        message: paramsError.issues.map((issue) => `${issue.path}, ${issue.message}`).join("\n"),
      });
    }

    // 학생 과제 조회 시작
    adminLog(`학생 과제 조회 (student_pk: "${req.query.pk}", ${paramsToString(params)})`, req);

    const db = pool;

    // 관리자가 아닌 경우 담당 학생만 조회 할 수 있도록 제한
    const isAdmin = await checkPermission("boolean", "student_admin_view", req, res);

    if (!isAdmin) {
      // 현재 로그인한 교직원 정보 조회
      const token = req.cookies["token"];

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "토큰이 없어요.",
        });
      }

      const payload = await decrypt<JWTPayload>(token);

      if (!payload) {
        return res.status(401).json({
          success: false,
          message: "토큰을 확인해주세요.",
        });
      }

      const [teachers] = await db.query<(RowDataPacket & Pick<API.Teacher, "teacher_pk">)[]>(
        "SELECT teacher_pk FROM teacher WHERE deleted_at IS NULL AND id = ?;",
        [payload.id],
      );

      if (teachers.length < 1) {
        return res.status(404).json({
          success: false,
          message: "관리자 정보를 찾을 수 없어요.",
        });
      }

      // 로그인한 교직원이 담당하는 과목 조회
      const [subjects] = await db.query<(RowDataPacket & Pick<API.Subject, "subject_pk">)[]>(
        "SELECT subject_pk FROM subject WHERE deleted_at IS NULL AND teacher = ?;",
        [teachers[0].teacher_pk],
      );

      if (!subjects.length) {
        return res.status(403).json({
          success: false,
          message: "담당 학생이 아니에요. (담당하고 있는 과목이 없어요.)",
        });
      }

      const subjectIds = subjects.reduce(
        (pre: number[], cur) => (cur.hasOwnProperty("subject_pk") ? [...pre, cur.subject_pk] : pre),
        [],
      );

      // 담당하는 과목의 학생 연결 정보 조회
      const [student_subject] = await db.query<(RowDataPacket & Pick<API.Subject, "subject_pk">)[]>(
        `
        SELECT
          student_subject_pk,
          student_id
        FROM student_subject
        WHERE deleted_at IS NULL AND (${subjectIds.map((id) => `subject_id = ${id}`).join(" OR ")});
        `,
        [teachers[0].teacher_pk],
      );

      if (!student_subject.length) {
        return res.status(403).json({
          success: false,
          message: "담당 학생이 아니에요.",
        });
      }
    }

    const whereConditions = [
      "student_homework.student_id = ?",
      "student_homework.homework_id IS NOT NULL",
      `(
        YEAR(homework.due_date) = ${params.year} AND MONTH(homework.due_date) = ${params.month}
      )`,
    ];

    const query = `
      SELECT 
        student_homework.*,
        DATE_FORMAT(student_homework.submitted_at, '%Y-%m-%dT%H:%i:%s') AS submitted_at,
        IF(
          student.student_pk IS NOT NULL, 
          JSON_OBJECT('name', student.name, 'deleted_at', student.deleted_at), 
          NULL
        ) as studentObj,
        IF(
          homework.homework_pk IS NOT NULL, 
          JSON_OBJECT(
            'homework_pk', homework.homework_pk,
            'subject_id', homework.subject_id,
            'title', homework.title,
            'description', homework.description,
            'due_date', homework.due_date,
            'created_at', homework.created_at,
            'updated_at', homework.updated_at,
            'deleted_at', homework.deleted_at
          ), 
          NULL
        ) as homeworkObj,
        IF(
          subject.subject_pk IS NOT NULL, 
          JSON_OBJECT(
            'subject_pk', subject.subject_pk,
            'name', subject.name,
            'teacher', subject.teacher,
            'school', subject.school,
            'grade', subject.grade,
            'is_personal', subject.is_personal,
            'grade', subject.grade,
            'created_at', subject.created_at,
            'updated_at', subject.updated_at,
            'deleted_at', subject.deleted_at
          ), 
          NULL
        ) as subjectObj
      FROM student_homework
      LEFT JOIN student ON student_homework.student_id = student.student_pk
      LEFT JOIN homework ON student_homework.homework_id = homework.homework_pk
      LEFT JOIN subject ON homework.subject_id = subject.subject_pk
      WHERE ${whereConditions.join(" AND ")}
    `;

    const [results] = await db.query<(RowDataPacket & API.Student)[]>(query, [req.query.pk]);

    return res.status(200).json({
      success: true,
      data: results,
      meta: { total: results.length },
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "학생 과제 조회중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
