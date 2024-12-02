import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
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

    // 데이터베이스에 연결하여 해당하는 유저가 있는지 확인하는 부분
    const db = pool;

    const [results] = await db.query<RowDataPacket[]>("SELECT * FROM teacher WHERE id = ?", [
      body.id,
    ]);

    if (results.length > 0) {
      const isCorrect = await bcrypt.compare(body.password, results[0].pwd);

      if (isCorrect) {
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
      } else {
        return res.status(401).json({
          success: false,
          message: "비밀번호를 확인해주세요.",
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: "아이디를 확인해주세요.",
      });
    }
  } catch (error) {
    console.log(error);

    return res.status(502).json({
      success: false,
      message: "로그인 처리중 서버에서 오류가 발생했어요. 서버 관리자에게 문의해주세요.",
    });
  }
}
