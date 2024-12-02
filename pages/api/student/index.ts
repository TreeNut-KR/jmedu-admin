import type { NextApiRequest, NextApiResponse } from "next";
import createStudent from "@/pages/api/student/createStudent";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    await createStudent(req, res);
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
