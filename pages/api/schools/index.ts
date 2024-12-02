import type { NextApiRequest, NextApiResponse } from "next";
import getSchools from "@/pages/api/schools/getSchools";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    await getSchools(req, res);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
