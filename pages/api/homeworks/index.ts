import type { NextApiRequest, NextApiResponse } from "next";
import getHomeworks from "@/pages/api/homeworks/getHomeworks";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    await getHomeworks(req, res);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
