import { loadEnvConfig } from "@next/env";
import mysql, { RowDataPacket } from "mysql2/promise";
import * as API from "@/types/api";
import { PERMISSION_DEFAULT_LEVELS, PERMISSIONS } from "@/constants";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_ROOT_HOST,
    port: process.env.MYSQL_ROOT_PORT ? Number(process.env.MYSQL_ROOT_PORT) : 3306,
    user: process.env.MYSQL_ROOT_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    charset: "utf8mb4",
    connectionLimit: 3,
  });

  const targetTables = ["student", "teacher"];

  // 컬럼 추가
  console.log("컬럼을 추가합니다.");

  for (const table of targetTables) {
    const [checkResult] = await connection.query<RowDataPacket[]>(`
      SHOW COLUMNS FROM ${table} WHERE Field = 'sex'
    `);

    if (checkResult.length === 0) {
      await connection.query(`
        ALTER TABLE ${table}
        ADD COLUMN sex TINYINT NOT NULL DEFAULT 0 AFTER name;
      `);
    }
  }

  // 컬럼 마이그레이션
  console.log("컬럼 정보를 마이그레이션합니다.");

  if (!process.env.OLD_SEX_COLUMN || !process.env.OLD_MALE_CODE || !process.env.OLD_FEMALE_CODE) {
    throw new Error("컬럼 정보를 마이그레이션하는데 필요한 정보를 찾을 수 없습니다.");
  }

  for (const table of targetTables) {
    await connection.query(`
      UPDATE ${table}
      SET sex = CASE 
        WHEN ${process.env.OLD_SEX_COLUMN} = ${process.env.OLD_MALE_CODE} THEN 1
        WHEN ${process.env.OLD_SEX_COLUMN} = ${process.env.OLD_FEMALE_CODE} THEN 2
        ELSE 0
      END;
    `);
  }

  // 작업 권한 추가
  console.log("작업 권한을 추가합니다.");

  for (const permission of PERMISSIONS) {
    const [checkResult] = await connection.query<RowDataPacket[]>(
      `
      SELECT *
      FROM permissions
      WHERE task_name = ?
    `,
      [permission],
    );

    if (checkResult.length === 0) {
      await connection.query(
        `
        INSERT INTO 
          permissions (task_name, level, created_at, updated_at) 
        VALUES 
          (?, ?, NOW(), NOW())
      `,
        [permission, PERMISSION_DEFAULT_LEVELS[permission]],
      );
    }
  }

  // 작업 권한 수정
  console.log("작업 권한을 수정합니다.");

  const targetPermissios: API.Task[] = ["permissions_view"];

  for (const permission of targetPermissios) {
    const [checkResult] = await connection.query<RowDataPacket[]>(
      `
      SELECT *
      FROM permissions
      WHERE task_name = ?
    `,
      [permission],
    );

    if (checkResult.length === 1) {
      await connection.query(
        `
        UPDATE permissions 
        SET level = ?
        WHERE task_name = ?
      `,
        [PERMISSION_DEFAULT_LEVELS[permission], permission],
      );
    }
  }

  await connection.end();
}

main();
