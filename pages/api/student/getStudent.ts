import { JWTPayload } from "jose";
import { RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { customErrorMap } from "@/utils";
import { adminLog, checkPermission, decrypt, pool } from "@/utils/server";
import { GetStudentSchema } from "@/schema";

export default async function getStudent(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkPermission("http", "students_view", req, res);

    // 필요한 쿼리
    const { data: params, error: paramsError } = GetStudentSchema.safeParse(req.query, {
      errorMap: customErrorMap,
    });

    if (!params) {
      return res.status(400).json({
        success: false,
        message: paramsError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 학생 조회 시작
    adminLog(`학생 조회 (student_pk: "${req.query.pk}")`, req);

    const db = pool;

    const whereConditions = ["student.is_enable = 1", "student.student_pk = ?"];

    if (!params.includeDeleted) {
      whereConditions.push("student.deleted_at IS NULL");
    }

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
      GROUP BY student.student_pk;
    `;

    const [results] = await db.query<(RowDataPacket & API.Student)[]>(query, [req.query.pk]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "해당 학생를 찾을 수 없어요.",
      });
    }

    if (results.length > 1) {
      return res.status(409).json({
        success: false,
        message: "중복된 student_pk를 가진 학생이 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    if (results[0].deleted_at) {
      return res.status(200).json({
        success: false,
        message: "삭제된 학생이에요.",
        data: results[0],
      });
    }

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

      // 조회할 학생이 수강중인 과목과 교직원이 담당하는 과목이 겹치치 않는 경우
      if (!results[0].subjects.some((el) => subjects.map((el) => el.subject_pk).includes(el))) {
        return res.status(403).json({
          success: false,
          message: "담당 학생이 아니에요.",
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: results[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "학생 조회중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
