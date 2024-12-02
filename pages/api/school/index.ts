import type { NextApiRequest, NextApiResponse } from "next";
import createSchool from "@/pages/api/school/createSchool";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    await createSchool(req, res);
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
