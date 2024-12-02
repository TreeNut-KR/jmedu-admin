import type { NextApiRequest, NextApiResponse } from "next";
import getStudents from "@/pages/api/students/getStudents";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    await getStudents(req, res);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
