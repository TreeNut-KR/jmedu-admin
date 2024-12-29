import { josa } from "es-hangul";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { adminLog, checkAuthenticated, pool } from "@/utils/server";

export default async function deleteTeacher(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 접근 권한 검증
    await checkAuthenticated("teacher_delete", req, res);

    // 교직원 삭제 시작
    adminLog(`교직원 삭제 (teacher_pk: "${req.query.pk}")`, req);

    const db = pool;

    const preQuery = `
      SELECT
        teacher_pk,
        deleted_at
      FROM teacher
      WHERE teacher_pk = ?
    `;

    const deleteQuery = "UPDATE teacher SET deleted_at = NOW() WHERE teacher_pk = ?";

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
      WHERE deleted_at IS NOT NULL AND teacher_pk = ?
    `;

    // 삭제할 교직원이 존재하는지 확인
    const [preResults] = await db.query<
      (RowDataPacket & Pick<API.Teacher, "teacher_pk" | "deleted_at">)[]
    >(preQuery, [req.query.pk]);

    // 삭제할 교직원이 존재하지 않는 경우
    if (preResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "삭제할 교직원을 찾을 수 없어요.",
      });
    }

    if (preResults.length > 1) {
      return res.status(409).json({
        success: false,
        message: "중복된 teacher_pk를 가진 교직원이 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    if (preResults[0].deleted_at) {
      return res.status(404).json({
        success: false,
        message: "이미 삭제된 교직원은 삭제할 수 없어요.",
      });
    }

    const [deleteResults] = await db.query<ResultSetHeader>(deleteQuery, [req.query.pk]);

    const [getResults] = await db.query<(RowDataPacket & API.Teacher)[]>(getQuery, [req.query.pk]);

    // 삭제된 열(교직원)이 1개 이상인경우
    if (deleteResults.affectedRows > 1) {
      return res.status(409).json({
        success: false,
        message: "교직원 삭제가 중복으로 발생했어요. 서버 관리자에게 문의해주세요.",
      });
    }

    // 삭제된 교직원을 찾을 수 없는 경우
    if (getResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "삭제된 교직원을 찾을 수 없어요. 서버 관리자에게 문의해주세요.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `교직원 '${getResults[0].name}'${josa.pick(getResults[0].name ?? "", "을/를")} 삭제했어요.`,
      data: getResults[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "교직원 삭제중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
