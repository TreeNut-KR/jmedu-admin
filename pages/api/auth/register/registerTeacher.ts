import bcrypt from "bcrypt";
import { josa } from "es-hangul";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import { pool } from "@/utils/server";
import { RegistrationSchema } from "@/schema";

export default async function registerTeacher(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 필요한 쿼리
    const { data: body, error: bodyError } = RegistrationSchema.safeParse(req.body);

    if (!body) {
      console.log(bodyError);

      return res.status(400).json({
        success: false,
        message: bodyError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 회원가입 시작
    const db = pool;

    // 아이디가 중복되는지 확인
    const checkQuery = `SELECT * FROM teacher WHERE id = ?`;

    const [checkResults] = await db.query<RowDataPacket[]>(checkQuery, body.id);

    if (checkResults.length) {
      return res.status(400).json({
        success: false,
        message: "이미 사용중인 아이디에요.",
      });
    }

    const preQuery = `SET @create_teacher_uuid = UUID();`;

    const insertQuery = ` 
      INSERT INTO 
        teacher (teacher_pk, name, id, pwd, sex, birthday, contact, admin_level) 
      VALUES 
        (@create_teacher_uuid, ?, ?, ?, ?, ?, ?, 0)
    `;

    const getQuery = `
      SELECT name
      FROM teacher
      WHERE deleted_at IS NULL AND teacher_pk = @create_teacher_uuid;
    `;

    await db.query<ResultSetHeader>(preQuery);

    await db.query<ResultSetHeader>(insertQuery, [
      body.name,
      body.id,
      await bcrypt.hash(body.password, 10),
      body.sex,
      body.birthday,
      body.contact,
    ]);

    const [getResults] = await db.query<RowDataPacket[]>(getQuery);

    // 생성된 교직원을 찾을 수 없는 경우
    if (getResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "생성된 교직원을 찾을 수 없어요. 서버 관리자에게 문의해주세요.",
      });
    }

    // 생성된 교직원과 같은 teacher_pk를 가진 교직원이 존재하는 경우
    if (getResults.length > 1) {
      return res.status(409).json({
        success: false,
        message: "생성된 교직원과 같은 pk를 가진 교직원이 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    // 구버전 대응
    if (process.env.OLD_SEX_COLUMN && process.env.OLD_MALE_CODE && process.env.OLD_FEMALE_CODE) {
      const legacyUpdateQuery = `
        UPDATE teacher
        SET ${process.env.OLD_SEX_COLUMN} = ?
        WHERE deleted_at IS NULL AND teacher_pk = @create_teacher_uuid
      `;

      await db.query<ResultSetHeader>(legacyUpdateQuery, [
        body.sex !== 2 ? Number(process.env.OLD_MALE_CODE) : Number(process.env.OLD_FEMALE_CODE),
      ]);
    }

    return res.status(201).json({
      success: true,
      message: `교직원 '${body.name}'${josa.pick(body.name, "을/를")} 등록했어요.`,
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "교직원 등록중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
