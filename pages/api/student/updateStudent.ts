import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import { adminLog, checkAuthenticated, pool } from "@/utils/server";
import { StudentSchema } from "@/schema";

export default async function updateStudent(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkAuthenticated("student_edit", req, res);

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
        *, 
        DATE_FORMAT(birthday, '%Y-%m-%d') AS birthday, 
        DATE_FORMAT(firstreg, '%Y-%m-%d') as firstreg
      FROM student
      WHERE deleted_at IS NULL AND is_enable = 1 AND student_pk = ?
    `;

    // 수정할 학생이 있는지 확인
    const [preResults] = await db.query<RowDataPacket[]>(getQuery, [req.query.pk]);

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

    const [getResults] = await db.query<RowDataPacket[]>(getQuery, [req.query.pk]);

    // 업데이트된 열(학생)이 1개 이상인경우
    if (updateResults.affectedRows > 1) {
      return res.status(409).json({
        success: false,
        message: "중복으로 업데이트가 발생했어요. 서버 관리자에게 문의해주세요.",
      });
    }

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
