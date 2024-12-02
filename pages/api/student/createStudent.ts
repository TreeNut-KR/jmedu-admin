import { josa } from "es-hangul";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import { adminLog, checkAuthenticated, pool } from "@/utils/server";
import { StudentSchema } from "@/schema";

export default async function createStudent(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkAuthenticated("student_add", req, res);

    // 필요한 쿼리
    const { data: body, error: bodyError } = StudentSchema.safeParse(req.body);

    if (!body) {
      return res.status(400).json({
        success: false,
        message: bodyError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 학생 생성 시작
    adminLog(`학생 생성 (name: "${body.name}")`, req);

    const db = pool;

    const preQuery = `SET @create_student_uuid = UUID();`;

    const createQuery = `
      INSERT INTO student (
        student_pk, name, sex, birthday, contact, contact_parent, school, payday, firstreg, created_at
      ) VALUES (
        @create_student_uuid, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
      )
    `;

    const getQuery = `
      SELECT
        *,
        DATE_FORMAT(birthday, '%Y-%m-%d') AS birthday,
        DATE_FORMAT(firstreg, '%Y-%m-%d') as firstreg
      FROM student
      WHERE deleted_at IS NULL AND is_enable = 1 AND student_pk = @create_student_uuid;
    `;

    await db.query<ResultSetHeader>(preQuery);

    await db.query<ResultSetHeader>(createQuery, [
      body.name,
      body.sex,
      body.birthday,
      body.contact,
      body.contact_parent,
      body.school,
      body.payday,
      body.firstreg,
    ]);

    const [getResults] = await db.query<RowDataPacket[]>(getQuery);

    // 생성된 학생을 찾을 수 없는 경우
    if (getResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "생성된 학생를 찾을 수 없어요. 서버 관리자에게 문의해주세요.",
      });
    }

    // 생성된 학생과 같은 student_pk를 가진 학생이 존재하는 경우
    if (getResults.length > 1) {
      return res.status(409).json({
        success: false,
        message: "생성된 학생과 같은 pk를 가진 학생이 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    // 구버전 대응
    if (process.env.OLD_SEX_COLUMN && process.env.OLD_MALE_CODE && process.env.OLD_FEMALE_CODE) {
      const legacyUpdateQuery = `
        UPDATE student 
        SET ${process.env.OLD_SEX_COLUMN} = ?
        WHERE deleted_at IS NULL AND is_enable = 1 AND student_pk = @create_student_uuid
      `;

      await db.query<ResultSetHeader>(legacyUpdateQuery, [
        body.sex !== 2 ? Number(process.env.OLD_MALE_CODE) : Number(process.env.OLD_FEMALE_CODE),
      ]);
    }

    return res.status(201).json({
      success: true,
      message: `학생 '${getResults[0].name}'${josa.pick(getResults[0].name, "을/를")} 생성했어요.`,
      data: getResults[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "학생 생성중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
