import { NextApiRequest, NextApiResponse } from "next";

const clientsPerRoom: Map<string, NextApiResponse[]> = new Map();

/**
 * The main API route of this app.
 *
 * When GET-ting this route, a server-sent events (SSE) reply stream is returned.
 *
 * When POST-ing new messages to this route, they will be delivered to all
 * subscribed SSE clients.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const room = req.query.room as string;

    if (req.method === "POST") {
        for (const client of clientsPerRoom.get(room) ?? []) {
            client.write(`event: message\n`);
            client.write(`data: ${JSON.stringify(req.body)}\n\n`);
        }
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

        clientsPerRoom.set(room, (clientsPerRoom.get(room) ?? []).concat([res]));

        req.on("close", () => {
            const clientsInRoom = clientsPerRoom.get(room) as NextApiResponse[];
            const index = clientsInRoom.indexOf(res);
            if (index > -1) {
                clientsInRoom.splice(index, 1);
            }
            clientsPerRoom.set(room, clientsInRoom);
            res.end();
        });
    }
}
