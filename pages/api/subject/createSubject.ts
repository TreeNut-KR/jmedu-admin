import { josa } from "es-hangul";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { adminLog, checkPermission, pool } from "@/utils/server";
import { SubjectSchema } from "@/schema";

export default async function createSubject(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkPermission("http", "subject_add", req, res);

    // 필요한 쿼리
    const { data: body, error: bodyError } = SubjectSchema.safeParse(req.body);

    if (!body) {
      return res.status(400).json({
        success: false,
        message: bodyError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 과목 생성 시작
    adminLog(`과목 생성 (name: "${body.name}")`, req);

    const db = pool;

    const createQuery = `
      INSERT INTO subject (
        name, teacher, school, grade, is_personal, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, NOW()
      )
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
      WHERE 
        subject.deleted_at IS NULL 
        AND subject.subject_pk = LAST_INSERT_ID();
    `;

    await db.query<ResultSetHeader>(createQuery, [
      body.name,
      body.teacher,
      body.school,
      body.grade,
      body.is_personal,
    ]);

    const [getResults] = await db.query<(RowDataPacket & API.Subject)[]>(getQuery);

    // 생성된 과목을 찾을 수 없는 경우
    if (getResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "생성된 과목를 찾을 수 없어요. 서버 관리자에게 문의해주세요.",
      });
    }

    // 생성된 과목과 같은 subject_pk를 가진 과목이 존재하는 경우
    if (getResults.length > 1) {
      return res.status(409).json({
        success: false,
        message: "생성된 과목와 같은 subject_pk를 가진 과목이 있어요. 서버 관리자에게 문의해주세요",
      });
    }

    return res.status(201).json({
      success: true,
      message: `과목 '${body.name ?? ""}'${josa.pick(body.name ?? "", "을/를")} 생성했어요.`,
      data: getResults[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "과목 생성중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
