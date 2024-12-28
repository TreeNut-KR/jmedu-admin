import type { NextApiRequest, NextApiResponse } from "next";
import deleteSubject from "@/pages/api/subject/deleteSubject";
import getSubject from "@/pages/api/subject/getSubject";
import updateSubject from "@/pages/api/subject/updateSubject";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    await getSubject(req, res);
  } else if (req.method === "PUT") {
    await updateSubject(req, res);
  } else if (req.method === "DELETE") {
    await deleteSubject(req, res);
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
