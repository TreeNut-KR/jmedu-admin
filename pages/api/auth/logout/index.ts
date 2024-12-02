import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    res.setHeader('Set-Cookie', `token=; path=/; max-age=0`);
    res.status(200).json({
      success: true,
      message: "로그아웃되었어요.",
    });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
