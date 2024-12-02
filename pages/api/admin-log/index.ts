import type { NextApiRequest, NextApiResponse } from "next";
import getAdminLog from "@/pages/api/admin-log/getAdminLog";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    await getAdminLog(req, res);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
