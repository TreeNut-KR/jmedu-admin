import { JWTPayload } from "jose";
import { RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { decrypt, pool } from "@/utils/server";

export default async function getAuthStatus(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.cookies["token"];

    if (!token) {
      return res.status(200).json({
        success: false,
        message: "로그인 정보가 없어요.",
      });
    }

    const payload = await decrypt<JWTPayload>(token);

    if (!payload) {
      return res.status(200).json({
        success: false,
        message: "잘못된 로그인 정보에요.",
      });
    }

    const db = pool;

    const [teachers] = await db.query<(RowDataPacket & API.Teacher)[]>(
      `
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
      WHERE id = ?;
      `,
      [payload.id],
    );

    if (teachers.length < 1) {
      return res.status(404).json({
        success: false,
        message: "유저를 찾을 수 없어요.",
      });
    }

    if (teachers.length > 1) {
      return res.status(409).json({
        success: false,
        message: "중복된 유저가 있어요. 서버 관리자에게 문의해주세요.",
      });
    }

    return res.status(200).json({
      success: true,
      data: teachers[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "유저 정보 조회중 에러가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
