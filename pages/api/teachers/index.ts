import type { NextApiRequest, NextApiResponse } from "next";
import getTeachers from "@/pages/api/teachers/getTeachers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    await getTeachers(req, res);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
