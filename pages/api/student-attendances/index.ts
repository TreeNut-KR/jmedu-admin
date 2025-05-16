import type { NextApiRequest, NextApiResponse } from "next";
import getStudentAttendances from "@/pages/api/student-attendances/getStudentAttendances";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    await getStudentAttendances(req, res);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
