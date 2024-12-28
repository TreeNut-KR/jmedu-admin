import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import { adminLog, checkAuthenticated, pool } from "@/utils/server";
import { SchoolSchema } from "@/schema";

export default async function updateSchool(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkAuthenticated("school_edit", req, res);

    // 필요한 쿼리
    const { data: body, error: bodyError } = SchoolSchema.safeParse(req.body);

    if (!body) {
      return res.status(400).json({
        success: false,
        message: bodyError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 학교 수정 시작
    adminLog(`학교 수정 (school_pk: ${req.query.pk})`, req);

    if (req.query.pk === "0" || body.name === "학교 미설정" || body.name === "학교 미지정") {
      return res.status(404).json({
        success: false,
        message: `'${body.name}'은 수정할 수 없어요.`,
      });
    }

    const db = pool;

    const updateQuery = `
      UPDATE school 
      SET 
        name = ?, 
        is_elementary = ?, 
        is_middle = ?, 
        is_high = ?,
        updated_at = NOW()
      WHERE school_pk = ?
    `;

    const getQuery = `
      SELECT *
      FROM school
      WHERE deleted_at IS NULL AND school_pk = ?
    `;

    // 수정할 학교가 존재하는지 확인
    const [preResults] = await db.query<RowDataPacket[]>(getQuery, [req.query.pk]);

    // 수정할 학교가 존재하지 않는 경우
    if (preResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "수정할 학교를 찾을 수 없어요.",
      });
    }

    if (preResults.length > 1) {
      return res.status(409).json({
        success: false,
        message: "중복된 school_pk를 가진 학교가 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    const [updateResults] = await db.query<ResultSetHeader>(updateQuery, [
      body.name,
      body.is_elementary,
      body.is_middle,
      body.is_high,
      req.query.pk,
    ]);

    const [getResults] = await db.query<RowDataPacket[]>(getQuery, [req.query.pk]);

    // 업데이트된 열(학교)이 1개 이상인경우
    if (updateResults.affectedRows > 1) {
      return res.status(409).json({
        success: false,
        message: "중복으로 수정이가 발생했어요. 서버 관리자에게 문의해주세요.",
      });
    }

    // 업데이트된 학교을 찾을 수 없는 경우
    if (getResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "수정된 학교를 찾을 수 없어요. 서버 관리자에게 문의해주세요.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `학교 '${getResults[0].name}'의 정보를 수정했어요.`,
      data: getResults[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "학교 정보 수정중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
