import type { NextApiRequest, NextApiResponse } from "next";
import updateStudentHomework from "./updateStudentHomework";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PUT") {
    await updateStudentHomework(req, res);
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
