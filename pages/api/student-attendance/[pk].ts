import type { NextApiRequest, NextApiResponse } from "next";
import getStudentAttendance from "@/pages/api/student-attendance/getStudentAttendance";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    await getStudentAttendance(req, res);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
