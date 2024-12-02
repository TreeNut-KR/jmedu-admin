import type { NextApiRequest, NextApiResponse } from "next";
import deleteSchool from "@/pages/api/school/deleteSchool";
import getSchool from "@/pages/api/school/getSchool";
import updateSchool from "@/pages/api/school/updateSchool";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    await getSchool(req, res);
  } else if (req.method === "PUT") {
    await updateSchool(req, res);
  } else if (req.method === "DELETE") {
    await deleteSchool(req, res);
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
