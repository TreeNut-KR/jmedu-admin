import { josa } from "es-hangul";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { adminLog, checkPermission, pool } from "@/utils/server";

export default async function deleteSchool(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkPermission("http", "school_delete", req, res);

    // 학교 삭제 시작
    adminLog(`학교 삭제 (school_pk: ${req.query.pk})`, req);

    if (req.query.pk === "0") {
      return res.status(404).json({
        success: false,
        message: "학교 기본값은 삭제할 수 없어요.",
      });
    }

    const db = pool;

    const preQuery = `
      SELECT 
        school_pk,
        name,
        deleted_at
      FROM school
      WHERE school_pk = ?
    `;

    const deleteQuery = "UPDATE school SET deleted_at = NOW() WHERE school_pk = ?";

    const getQuery = `
      SELECT *
      FROM school
      WHERE deleted_at IS NOT NULL AND school_pk = ?
    `;

    // 삭제할 학교가 존재하는지 확인
    const [preResults] = await db.query<
      (RowDataPacket & Pick<API.School, "school_pk" | "deleted_at">)[]
    >(preQuery, [req.query.pk]);

    // 삭제할 학교가 존재하지 않는 경우
    if (preResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "삭제할 학교를 찾을 수 없어요.",
      });
    }

    if (preResults.length > 1) {
      return res.status(409).json({
        success: false,
        message: "중복된 school_pk를 가진 학교가 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    if (preResults[0].deleted_at) {
      return res.status(404).json({
        success: false,
        message: "이미 삭제된 학교는 삭제할 수 없어요.",
      });
    }

    if (preResults[0].name === "학교 미설정" || preResults[0].name === "학교 미지정") {
      return res.status(404).json({
        success: false,
        message: `'${preResults[0].name}'은 삭제 할 수 없어요.`,
      });
    }

    const [deleteResults] = await db.query<ResultSetHeader>(deleteQuery, [req.query.pk]);

    const [getResults] = await db.query<(RowDataPacket & API.School)[]>(getQuery, [req.query.pk]);

    // 삭제된 열(학교)이 1개 이상인경우
    if (deleteResults.affectedRows > 1) {
      return res.status(409).json({
        success: false,
        message: "중복으로 삭제가 발생했어요. 서버 관리자에게 문의해주세요.",
      });
    }

    // 삭제된 학교을 찾을 수 없는 경우
    if (getResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "삭제된 학교를 찾을 수 없어요. 서버 관리자에게 문의해주세요.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `학교 '${getResults[0].name}'${josa.pick(getResults[0].name ?? "", "을/를")} 삭제했어요.`,
      data: getResults[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "학교 삭제중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
