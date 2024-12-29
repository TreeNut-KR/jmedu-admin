import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import * as API from "@/types/api";
import { adminLog, encrypt, pool } from "@/utils/server";
import { LoginSchema } from "@/schema";

export default async function handleLogin(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 입력을 검증하는 부분
    const { data: body, error: bodyError } = LoginSchema.safeParse(req.body);

    if (!body) {
      console.log(bodyError);

      return res.status(400).json({
        success: false,
        message: bodyError.issues.map((issue) => issue.message).join("\n"),
      });
    }

    const db = pool;

    const [results] = await db.query<(RowDataPacket & API.Teacher)[]>(
      "SELECT * FROM teacher WHERE id = ?",
      [body.id],
    );

    if (results.length > 1) {
      return res.status(409).json({
        success: false,
        message: "중복된 id를 사용하는 교직원이 있어요.\n서버 관리자에게 문의해주세요.",
      });
    }

    const isCorrect = results.length ? await bcrypt.compare(body.password, results[0].pwd) : false;

    if (!isCorrect) {
      return res.status(401).json({
        success: false,
        message: "입력하신 정보가 일치하지 않아요.\n아이디와 비밀번호를 다시 확인해주세요.",
      });
    }

    const user = {
      id: results[0].id,
    };
    const expires = new Date(Date.now() + 50 * 60 * 1000);
    const session = await encrypt(user);

    // 로그 기록
    req.cookies = { ...req.cookies, token: session };
    adminLog("로그인", req);

    res.setHeader("Set-Cookie", `token=${session}; path=/; Expires=${expires.toUTCString()}`);
    return res.status(200).json({
      success: true,
      message: "로그인되었어요.",
    });
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "로그인 처리중 서버에서 오류가 발생했어요.\n서버 관리자에게 문의해주세요.",
    });
  }
}
