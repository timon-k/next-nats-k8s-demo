import { NextApiRequest, NextApiResponse } from "next";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
  res.setHeader("Content-Encoding", "none");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");

  let terminate = false;
  req.on("close", () => {
    terminate = true;
  });

  for (let i = 0; !terminate; i++) {
    res.write(`event: message\n`);
    res.write(`data: Message ${i}\n\n`);
    await sleep(1000);
  }
  res.end();
};

export default handler;
