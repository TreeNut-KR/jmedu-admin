import { JWTPayload, jwtVerify, SignJWT } from "jose";
import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { NextApiRequest, NextApiResponse } from "next";
import type * as API from "@/types/api";

export const pool = mysql.createPool({
  host: process.env.MYSQL_ROOT_HOST,
  port: process.env.MYSQL_ROOT_PORT ? Number(process.env.MYSQL_ROOT_PORT) : 3306,
  user: process.env.MYSQL_ROOT_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  charset: "utf8mb4",
  connectionLimit: 3,
});

export async function encrypt(payload: JWTPayload) {
  const key = new TextEncoder().encode(process.env.SESSION_SECRET);

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
}

export async function decrypt<T>(input: string) {
  try {
    const key = new TextEncoder().encode(process.env.SESSION_SECRET);

    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload as T;
  } catch (error: unknown) {
    console.log(error);
    return false;
  }
}

export async function checkAuthenticated(
  taskName: API.Task,
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = req.cookies["token"];

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "토큰이 없어요.",
    });
  }

  const payload = await decrypt<JWTPayload>(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      message: "토큰을 확인해주세요.",
    });
  }

  const db = pool;

  const [teachers] = await db.query<RowDataPacket[]>(
    "SELECT admin_level FROM teacher WHERE id = ?;",
    [payload.id],
  );

  const [results] = await db.query<RowDataPacket[]>(
    "SELECT * FROM permissions WHERE task_name = ?;",
    [taskName],
  );

  if (teachers.length < 1) {
    return res.status(404).json({
      success: false,
      message: "관리자 정보를 찾을 수 없어요.",
    });
  }

  if (results.length < 1) {
    return res.status(404).json({
      success: false,
      message: "접근 권한을 찾을 수 없어요.",
    });
  }

  if (results[0].level > teachers[0].admin_level) {
    return res.status(403).json({
      success: false,
      message: "접근 권한이 없어요.",
    });
  } else {
    return undefined;
  }
}

export async function adminLog(message: string, req: NextApiRequest) {
  try {
    const db = pool;

    const createQuery = `
      INSERT INTO admin_log (
        teacher, time, log
      ) VALUES (
        ?, NOW(), ?
      )
    `;

    const token = req.cookies["token"];

    if (!token) {
      return undefined;
    }

    const payload = await decrypt<JWTPayload>(token);

    if (!payload) {
      return undefined;
    }

    const preQuery = `
      SELECT 
        teacher_pk,
        name,
        admin_level,
        created_at,
        updated_at,
        deleted_at
      FROM teacher
      WHERE deleted_at IS NULL AND id = ?`;

    const [preResults] = await db.query<RowDataPacket[]>(preQuery, [payload.id]);

    if (preResults.length === 0) {
      return undefined;
    }

    const [createResults] = await db.query<ResultSetHeader>(createQuery, [
      preResults[0].teacher_pk,
      message.slice(0, 255),
    ]);

    return createResults;
  } catch (error) {
    console.log(error);
  }
}

export function paramsToString(obj: { [key: string]: unknown }) {
  return Object.entries(obj)
    .map((el) => {
      const key = el[0];
      const value = JSON.stringify(el[1]);

      return `${key}: ${value}`;
    })
    .join(", ");
}
