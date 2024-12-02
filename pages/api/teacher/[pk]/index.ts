import type { NextApiRequest, NextApiResponse } from "next";
import deleteTeacher from "@/pages/api/teacher/deleteTeacher";
import getTeacher from "@/pages/api/teacher/getTeacher";
import updateTeacher from "@/pages/api/teacher/updateTeacher";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    await getTeacher(req, res);
  } else if (req.method === "PUT") {
    await updateTeacher(req, res);
  } else if (req.method === "DELETE") {
    await deleteTeacher(req, res);
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
