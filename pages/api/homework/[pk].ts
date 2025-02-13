import type { NextApiRequest, NextApiResponse } from "next";
import deleteHomework from "@/pages/api/homework/deleteHomework";
import getHomework from "@/pages/api/homework/getHomework";
import updateHomework from "@/pages/api/homework/updateHomework";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    await getHomework(req, res);
  } else if (req.method === "PUT") {
    await updateHomework(req, res);
  } else if (req.method === "DELETE") {
    await deleteHomework(req, res);
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
