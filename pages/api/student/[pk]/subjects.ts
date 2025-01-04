import type { NextApiRequest, NextApiResponse } from "next";
import updateStudentSubjects from "@/pages/api/student/updateStudentSubjects";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PUT") {
    await updateStudentSubjects(req, res);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
