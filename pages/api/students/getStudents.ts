import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { adminLog, checkPermission, decrypt, paramsToString, pool } from "@/utils/server";
import { GetStudentsSchema } from "@/schema";
import type { JWTPayload } from "jose";
import type { RowDataPacket } from "mysql2/promise";

export default async function getStudents(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkPermission("http", "students_view", req, res);

    // 필요한 쿼리
    const { data: params, error: paramsError } = GetStudentsSchema.safeParse(req.query);

    if (!params) {
      return res.status(400).json({
        success: false,
        message: paramsError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 학생 목록 조회 시작
    adminLog(`학생 목록 조회 (${paramsToString(params)})`, req);

    const db = pool;

    const whereConditions = ["student.is_enable = 1"];

    if (!params.includeDeleted) {
      whereConditions.push("student.deleted_at IS NULL");
    }

    if (params.filter && params.search) {
      whereConditions.push(`student.${params.filter} LIKE '${params.search}'`);
    }

    // 전체 학생 목록을 조회할 수 있는지 확인
    const isAdmin = await checkPermission("boolean", "students_admin_view", req, res);

    // 전체 학생 목록을 조회할 수 없는 경우
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

      // 조건문에 추가
      if (subjects.length) {
        whereConditions.push(
          `(${subjects.map((el) => `student_subject.subject_id = ${el.subject_pk}`).join(" OR ")})`,
        );
      }
    }

    const limitClause = params.limit > 0 ? `LIMIT ${params.limit}` : ``;

    const offsetClause = params.limit > 0 ? `OFFSET ${(params.page - 1) * params.limit}` : ``;

    const query = `
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
      LEFT JOIN 
          subject ON student_subject.student_subject_pk = subject.subject_pk
      WHERE ${whereConditions.join(" AND ")}
      GROUP BY student.student_pk
      ORDER BY ${params.sort} ${params.order.toUpperCase()}
      ${limitClause}
      ${offsetClause};
    `;

    const metaQuery = `
      SELECT count(*) AS count
      FROM student
      LEFT JOIN school ON student.school = school.school_pk
      LEFT JOIN 
          student_subject ON student.student_pk = student_subject.student_id
          AND student_subject.student_subject_pk IS NOT NULL
          AND student_subject.deleted_at IS NULL
      LEFT JOIN 
          subject ON student_subject.student_subject_pk = subject.subject_pk
      WHERE ${whereConditions.join(" AND ")}
    `;

    const [results] = await db.query<(RowDataPacket & API.Student)[]>(query);
    const [metaResult] = await db.query<(RowDataPacket & { count: number })[]>(metaQuery);

    return res.status(200).json({
      success: true,
      data: results,
      meta: { total: metaResult[0].count },
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "학생 조회중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
