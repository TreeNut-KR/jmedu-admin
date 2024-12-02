import type { NextApiRequest, NextApiResponse } from "next";
import updatePermission from "@/pages/api/permission/updatePermission";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PUT") {
    await updatePermission(req, res);
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
