import type { NextApiRequest, NextApiResponse } from "next";
import getStudentHomework from "@/pages/api/student-homework/getStudentHomework";
import updateStudentHomework from "@/pages/api/student-homework/updateStudentHomework";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    await getStudentHomework(req, res);
  } else if (req.method === "PUT") {
    await updateStudentHomework(req, res);
  } else {
    res.setHeader("Allow", ["GET", "PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
