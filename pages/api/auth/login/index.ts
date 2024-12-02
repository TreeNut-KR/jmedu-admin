import type { NextApiRequest, NextApiResponse } from "next";
import handleLogin from "@/pages/api/auth/login/handleLogin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    await handleLogin(req, res);
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
