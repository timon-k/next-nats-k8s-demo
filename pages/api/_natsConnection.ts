import { connect, NatsConnection, StringCodec } from "nats";
import getConfig from "next/config";
import { Message } from "../../modules/Message";
import { logger } from "./_logger";

const { serverRuntimeConfig } = getConfig();

/**
 * Since we do not have an explicit server setup/teardown phase, we use a module variable for the
 * NATS connection.
 *
 * However, this connection should actually also be drained and closed cleanly once we have a
 * custom server with proper teardown.
 */
let natsConnection: NatsConnection | null = null;

async function connectToNatsServer(): Promise<NatsConnection> {
    if (!natsConnection) {
        const url = serverRuntimeConfig.nats.serverUrl;
        try {
            natsConnection = await connect({ servers: url });
            logger.info(`Connected to NATS server at ${natsConnection.getServer()}`);
        } catch (err) {
            logger.error(`Error connecting to NATS server at ${url}: ${err}`);
            throw err;
        }
    }

    return natsConnection;
}

type ChatMessageSubscription = {
    [Symbol.asyncIterator](): AsyncIterator<Message>;
    unsubscribe(): void;
};

const sc = StringCodec();

export async function subscribeToRoom(chatroom: string): Promise<ChatMessageSubscription> {
    const conn = await connectToNatsServer();
    const plainSubscription = conn.subscribe(chatroom);
    return {
        [Symbol.asyncIterator]: async function* () {
            for await (const plainMessage of plainSubscription) {
                yield JSON.parse(sc.decode(plainMessage.data)) as Message;
            }
        },
        unsubscribe: function (): void {
            plainSubscription.unsubscribe();
        },
    };
}

export async function publishToRoom(chatroom: string, message: Message): Promise<void> {
    const conn = await connectToNatsServer();
    conn.publish(chatroom, sc.encode(JSON.stringify(message)));
}
