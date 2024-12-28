import type { NextApiRequest, NextApiResponse } from "next";
import createSubject from "@/pages/api/subject/createSubject";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    await createSubject(req, res);
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
