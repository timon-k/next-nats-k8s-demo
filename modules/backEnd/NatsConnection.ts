import { connect, createInbox, JsMsg, Msg, NatsConnection, StringCodec } from "nats";
import { consumerOpts } from "nats/lib/nats-base-client/jsconsumeropts";
import { LoginData } from "../LoginData";
import { ChatEvent, Message, UserLogin, UserLogout } from "../Message";
import { getTypedConfig } from "./Config";
import { logger } from "./Logger";
import { commonShutdownHook } from "./Shutdown";

const { serverRuntimeConfig } = getTypedConfig();

/**
 * Since we do not have an explicit server setup/teardown phase, we use a module variable for the
 * NATS connection.
 *
 * However, this connection should actually also be drained and closed cleanly once we have a
 * custom server with proper teardown.
 *
 * Our NATS subject tree is as follows:
 * - chatroom
 *   - <Name>
 *     - messages
 *     - metadata
 *
 * For a chatroom named `foo`, the messages go into subject `chatroom.foo.messages` whereas all
 * user logins and logouts are written to `chatroom.foo.metadata`. The latter will also be mirrored
 * by a JetStream stream, such that clients which connect to the room can read the persistent
 * metadata. The messages are ephemeral and are not stored.
 */
let natsConnection: NatsConnection | null = null;

function getChatroomSubject(chatroomName: string): string {
    return `chatroom.${chatroomName}`;
}

function getChatroomMessageSubject(chatroomName: string): string {
    return getChatroomSubject(chatroomName) + ".messages";
}

function getChatroomMetadataSubject(chatroomName: string): string {
    return getChatroomSubject(chatroomName) + ".metadata";
}

function getChatroomStream(chatroomName: string): string {
    return getChatroomSubject(chatroomName).replace(/\./g, "-");
}

/** Creates the persistent stream used by our chat app, in case it is missing. */
async function setupJetStream(natsConnection: NatsConnection, chatroomName: string): Promise<void> {
    const jsm = await natsConnection.jetstreamManager();
    const streamName = getChatroomStream(chatroomName);

    await jsm.streams.info(streamName).catch(() => {
        return jsm.streams.add({
            name: streamName,
            subjects: [getChatroomMetadataSubject(chatroomName)],
        });
    });
}

async function connectToNatsServer(): Promise<NatsConnection> {
    if (!natsConnection) {
        const url = serverRuntimeConfig.nats.server;
        try {
            natsConnection = await connect({ servers: url });
            logger.info(`Connected to NATS server at ${natsConnection.getServer()}`);
        } catch (err) {
            logger.error(`Error connecting to NATS server at ${url}: ${err}`);
            throw err;
        }

        commonShutdownHook.add(
            () => {
                natsConnection?.drain();
                natsConnection?.close();
                logger.info(`Closed NATS connection`);
            },
            { name: "nats" },
        );
    }

    return natsConnection;
}

type ChatRoomSubscription = {
    [Symbol.asyncIterator](): AsyncIterator<ChatEvent>;
    unsubscribe(): Promise<void>;
};

const sc = StringCodec();

/** Combine multiple async iterables.
 *
 * Taken from https://stackoverflow.com/a/50586391.
 */
async function* combineAsyncIterables<ElementType>(
    iterable: Iterable<AsyncIterable<ElementType>>,
): AsyncIterable<ElementType> {
    const asyncIterators = Array.from(iterable, (o) => o[Symbol.asyncIterator]());
    const results = [];
    let count = asyncIterators.length;
    const never = new Promise(() => undefined);

    type IndexedIterationResult = {
        index: number;
        result: IteratorResult<ElementType, unknown>;
    };
    function getNext(
        asyncIterator: AsyncIterator<ElementType>,
        index: number,
    ): Promise<IndexedIterationResult> {
        return asyncIterator.next().then((result) => ({
            index,
            result,
        }));
    }

    const nextPromises: Promise<IndexedIterationResult | unknown>[] = asyncIterators.map(getNext);

    try {
        while (count) {
            const { index, result } = (await Promise.race(nextPromises)) as IndexedIterationResult;
            if (result.done) {
                nextPromises[index] = never;
                results[index] = result.value;
                count--;
            } else {
                nextPromises[index] = getNext(asyncIterators[index], index);
                yield result.value;
            }
        }
    } finally {
        for (const [index, iterator] of asyncIterators.entries())
            if (nextPromises[index] !== never && iterator.return) iterator.return();
        // no await here - see https://github.com/tc39/proposal-async-iteration/issues/126
    }
    return results;
}

export async function subscribeToRoom(login: LoginData): Promise<ChatRoomSubscription> {
    const conn = await connectToNatsServer();
    const messageSubscription = conn.subscribe(getChatroomMessageSubject(login.chatroom));

    // We already get the messages via NATS (so we do not consume them via JetStream), but we need
    // this call in order to create the stream.
    const js = conn.jetstream();
    await setupJetStream(conn, login.chatroom);

    // Fetch all metadata messages for this room.
    const opts = consumerOpts();
    opts.durable(login.username);
    opts.deliverAll();
    opts.deliverTo(createInbox());
    const currentRoomMetaSubject = getChatroomMetadataSubject(login.chatroom);
    const jsMsgs = await js.subscribe(currentRoomMetaSubject, opts);

    // Announce own login
    const ownLogin: UserLogin = {
        type: "login",
        username: login.username,
    };
    await js.publish(currentRoomMetaSubject, sc.encode(JSON.stringify(ownLogin)));

    // Merge the JetStream and the normal NATS results in the result iterator
    return {
        [Symbol.asyncIterator]: async function* () {
            for await (const plainEvent of combineAsyncIterables<Msg | JsMsg>([
                jsMsgs,
                messageSubscription,
            ])) {
                yield JSON.parse(sc.decode(plainEvent.data)) as ChatEvent;
            }
        },
        unsubscribe: async function (): Promise<void> {
            messageSubscription.unsubscribe();
            await jsMsgs.destroy();

            // Announce own logout
            const ownLogout: UserLogout = {
                type: "logout",
                username: login.username,
            };
            await js.publish(currentRoomMetaSubject, sc.encode(JSON.stringify(ownLogout)));
        },
    };
}

export async function publishToRoom(chatroomName: string, message: Message): Promise<void> {
    const conn = await connectToNatsServer();
    conn.publish(getChatroomMessageSubject(chatroomName), sc.encode(JSON.stringify(message)));
}
