import { NextApiRequest, NextApiResponse } from "next";
import { publishToRoom, subscribeToRoom } from "../../modules/backEnd/natsConnection";

/**
 * The main API route of this app.
 *
 * When GET-ting this route, a server-sent events (SSE) reply stream is returned.
 *
 * When POST-ing new messages to this route, they will be delivered to all
 * subscribed SSE clients.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const room = req.query.room as string;

    if (req.method === "POST") {
        publishToRoom(room, req.body);
        res.status(200);
        res.end();
    } else {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
        res.setHeader("Content-Encoding", "none");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("X-Accel-Buffering", "no");
        res.status(200);
        res.write(`\n`);

        const username = req.query.username as string;
        if (!username) {
            throw new Error("Missing username parameter!");
        }

        const subscription = await subscribeToRoom({
            username: username,
            chatroom: room,
        });

        req.socket.on("close", () => {
            (async () => subscription.unsubscribe())();
            res.end();
        });

        for await (const message of subscription) {
            res.write(`event: message\n`);
            res.write(`data: ${JSON.stringify(message)}\n\n`);
        }
    }
}
