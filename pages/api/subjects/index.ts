import type { NextApiRequest, NextApiResponse } from "next";
import getSubjects from "@/pages/api/subjects/getSubjects";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    await getSubjects(req, res);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
