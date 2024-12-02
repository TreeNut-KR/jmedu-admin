import type { NextApiRequest, NextApiResponse } from "next";
import updateTeahcerLevel from "@/pages/api/teacher/updateTeahcerLevel";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PUT") {
    await updateTeahcerLevel(req, res);
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
