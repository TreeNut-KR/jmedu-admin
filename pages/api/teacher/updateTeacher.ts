import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { adminLog, checkPermission, pool } from "@/utils/server";
import { TeacherSchema } from "@/schema";

export default async function updateTeacher(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkPermission("http", "teacher_edit", req, res);

    // 필요한 쿼리
    const { data: body, error: bodyError } = TeacherSchema.safeParse(req.body);

    if (!body) {
      return res.status(400).json({
        success: false,
        message: bodyError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 교직원 수정 시작
    adminLog(`교직원 수정 (teacher_pk: "${req.query.pk}")`, req);

    const db = pool;

    const updateQuery = `
      UPDATE teacher 
      SET 
        name = ?, 
        sex = ?, 
        birthday = ?, 
        contact = ?,
        updated_at = NOW() 
      WHERE deleted_at IS NULL AND teacher_pk = ?
    `;

    const getQuery = `
      SELECT 
        teacher_pk,
        name,
        sex,
        contact,
        admin_level,
        created_at,
        updated_at,
        deleted_at,
        DATE_FORMAT(birthday, '%Y-%m-%d') AS birthday
      FROM teacher
      WHERE deleted_at IS NULL AND teacher_pk = ?
    `;

    // 수정할 교직원이 있는지 확인
    const [preResults] = await db.query<(RowDataPacket & API.Teacher)[]>(getQuery, [req.query.pk]);

    // 수정할 교직원이 없는 경우
    if (preResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "수정할 교직원을 찾을 수 없어요.",
      });
    }

    if (preResults.length > 1) {
      return res.status(409).json({
        success: false,
        message: "중복된 teacher_pk를 가진 교직원이 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    const [updateResults] = await db.query<ResultSetHeader>(updateQuery, [
      body.name,
      body.sex,
      body.birthday,
      body.contact,
      req.query.pk,
    ]);

    const [getResults] = await db.query<(RowDataPacket & API.Teacher)[]>(getQuery, [req.query.pk]);

    // 업데이트된 열(교직원)이 1개 이상인경우
    if (updateResults.affectedRows > 1) {
      return res.status(409).json({
        success: false,
        message: "중복으로 업데이트가 발생했어요. 서버 관리자에게 문의해주세요.",
      });
    }

    // 업데이트된 교직원을 찾을 수 없는 경우
    if (getResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "업데이트된 교직원을 찾을 수 없어요. 서버 관리자에게 문의해주세요.",
      });
    }

    // 구버전 대응
    if (process.env.OLD_SEX_COLUMN && process.env.OLD_MALE_CODE && process.env.OLD_FEMALE_CODE) {
      const legacyUpdateQuery = `
        UPDATE teacher 
        SET ${process.env.OLD_SEX_COLUMN} = ?
        WHERE teacher_pk = ?
      `;

      await db.query<ResultSetHeader>(legacyUpdateQuery, [
        body.sex !== 2 ? Number(process.env.OLD_MALE_CODE) : Number(process.env.OLD_FEMALE_CODE),
        req.query.pk,
      ]);
    }

    return res.status(200).json({
      success: true,
      message: `교직원 '${getResults[0].name}'의 정보를 수정했어요.`,
      data: getResults[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "교직원 업데이트중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
