import type { NextApiRequest, NextApiResponse } from "next";
import getAuthStatus from "@/pages/api/auth/status/getAuthStatus";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    await getAuthStatus(req, res);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
