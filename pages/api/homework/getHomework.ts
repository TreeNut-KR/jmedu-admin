import { RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { customErrorMap } from "@/utils";
import { adminLog, checkPermission, pool } from "@/utils/server";
import { GetHomeworkSchema } from "@/schema";

export default async function getHomework(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkPermission("http", "homework_view", req, res);

    // 필요한 쿼리
    const { data: params, error: paramsError } = GetHomeworkSchema.safeParse(req.query, {
      errorMap: customErrorMap,
    });

    if (!params) {
      return res.status(400).json({
        success: false,
        message: paramsError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 과제 조회 시작
    adminLog(`과제 조회 (homework_pk: "${req.query.pk}")`, req);

    const db = pool;

    const whereConditions = ["homework.homework_pk = ?"];

    if (!params.includeDeleted) {
      whereConditions.push("homework.deleted_at IS NULL");
    }

    const query = `
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
      WHERE ${whereConditions.join(" AND ")}
      GROUP BY homework.homework_pk;
    `;

    const [results] = await db.query<(RowDataPacket & API.Homework)[]>(query, [req.query.pk]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "해당 과제를 찾을 수 없어요.",
      });
    }

    if (results.length > 1) {
      return res.status(409).json({
        success: false,
        message: "중복된 homework_pk를 가진 과제가 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    if (results[0].deleted_at) {
      return res.status(200).json({
        success: false,
        message: "삭제된 과제에요.",
        data: results[0],
      });
    }

    return res.status(200).json({
      success: true,
      data: results[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "과제 조회중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
