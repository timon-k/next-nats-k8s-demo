import * as React from "react";
import { ReactElement, useEffect, useReducer, useState } from "react";
import { getTypedClientConfig } from "../modules/backEnd/Config";
import { LoginData } from "../modules/LoginData";
import { ChatEvent } from "../modules/ChatEvent";

const config = getTypedClientConfig().publicRuntimeConfig;

function chatEventElement(event: ChatEvent): ReactElement {
    if (!event.chatEvent) {
        return <></>;
    }

    switch (event.chatEvent?.$case) {
        case "message":
            return (
                <>
                    <i>{event.chatEvent.message.username}</i> {event.chatEvent.message.message}
                </>
            );
        case "login":
            return <i>{event.chatEvent.login.username} joined the room</i>;
        case "logout":
            return <i>{event.chatEvent.logout.username} left the room</i>;
        default:
            console.error(`Received message of unknown type: ${event}`);
            return <></>;
    }
}

export default function ChatMessages(props: { login: LoginData }): ReactElement {
    const [chatEvents, addChatEvent] = useReducer(
        (s: ChatEvent[], a: ChatEvent) => [a].concat(s),
        [] as ChatEvent[],
    );
    const [error, setError] = useState(false);

    useEffect(() => {
        const sse = new EventSource(
            `${config.basePath}/api/${props.login.chatroom}?username=${props.login.username}`,
            { withCredentials: true },
        );

        sse.onmessage = (e) => {
            addChatEvent(JSON.parse(e.data as string) as ChatEvent);
        };
        sse.onerror = () => {
            setError(true);
            sse.close();
        };
        return () => {
            sse.close();
        };
    }, [props.login, addChatEvent]);

    if (error) {
        return <div>Could not connect to server</div>;
    } else if (chatEvents.length > 0) {
        return (
            <div>
                {chatEvents.map((item, index) => (
                    <div key={index}>
                        {chatEventElement(item)} <br />
                    </div>
                ))}
            </div>
        );
    } else {
        return <div>&lt;None&gt;</div>;
    }
}
