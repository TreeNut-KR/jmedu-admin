import type { NextApiRequest, NextApiResponse } from "next";
import getPermissions from "@/pages/api/permissions/getPermissions";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    await getPermissions(req, res);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
