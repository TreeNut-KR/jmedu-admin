import type { NextApiRequest, NextApiResponse } from "next";
import deleteStudent from "@/pages/api/student/deleteStudent";
import getStudent from "@/pages/api/student/getStudent";
import updateStudent from "@/pages/api/student/updateStudent";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    await getStudent(req, res);
  } else if (req.method === "PUT") {
    await updateStudent(req, res);
  } else if (req.method === "DELETE") {
    await deleteStudent(req, res);
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
