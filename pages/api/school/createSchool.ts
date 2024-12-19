import { josa } from "es-hangul";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import { adminLog, checkAuthenticated, pool } from "@/utils/server";
import { SchoolSchema } from "@/schema";

export default async function createSchool(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkAuthenticated("school_add", req, res);

    // 필요한 쿼리
    const { data: body, error: bodyError } = SchoolSchema.safeParse(req.body);

    if (!body) {
      return res.status(400).json({
        success: false,
        message: bodyError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    // 학교 생성 시작
    adminLog(`학교 생성 (name: "${body.name}")`, req);

    if (body.name === "학교 미설정" || body.name === "학교 미지정") {
      return res.status(404).json({
        success: false,
        message: `'${body.name}'은 생성 할 수 없어요.`,
      });
    }

    const db = pool;

    const createQuery = `
      INSERT INTO school (
        name, is_elementary, is_middle, is_high
      ) VALUES (
        ?, ?, ?, ?
      )
    `;

    const getQuery = `
      SELECT *
      FROM school
      WHERE 
        deleted_at IS NULL 
        AND school_pk != 0 
        AND name != '학교 미설정' 
        AND name != '학교 미지정' 
        AND school_pk = LAST_INSERT_ID();
    `;

    // TODO: preQuery 실패 여부 확인 후 에러처리 필요

    await db.query<ResultSetHeader>(createQuery, [
      body.name,
      body.is_elementary,
      body.is_middle,
      body.is_high,
    ]);

    const [getResults] = await db.query<RowDataPacket[]>(getQuery);

    // 생성된 학교을 찾을 수 없는 경우
    if (getResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "생성된 학교를 찾을 수 없어요. 서버 관리자에게 문의해주세요.",
      });
    }

    // 생성된 학교과 같은 school_pk를 가진 학교이 존재하는 경우
    if (getResults.length > 1) {
      return res.status(409).json({
        success: false,
        message: "생성된 학교과 같은 school_pk를 가진 학교가 있어요. 서버 관리자에게 문의해주세요",
      });
    }

    return res.status(201).json({
      success: true,
      message: `학교 '${body.name}'${josa.pick(body.name, "을/를")} 생성했어요.`,
      data: getResults[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "학교 생성중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
