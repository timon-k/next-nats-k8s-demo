import * as React from "react";
import { ReactElement, useEffect } from "react";
import { LoginData } from "../modules/LoginData";
import { ChatEvent } from "../modules/Message";

function chatEventElement(event: ChatEvent): ReactElement {
    switch (event.type) {
        case "message":
            return (
                <>
                    <i>{event.username}</i> {event.message}
                </>
            );
        case "login":
            return <i>{event.username} joined the room</i>;
        case "logout":
            return <i>{event.username} left the room</i>;
        default:
            console.error(`Received message of unknown type: ${event}`);
            return <></>;
    }
}

export default function ChatMessages(props: { login: LoginData }): ReactElement {
    const [chatEvents, setChatEvents] = React.useState([] as ChatEvent[]);
    const [error, setError] = React.useState(false);

    useEffect(() => {
        const sse = new EventSource(
            `./api/${props.login.chatroom}?username=${props.login.username}`,
            { withCredentials: true },
        );
        let sseEvents: ChatEvent[] = [];

        sse.onmessage = (e) => {
            sseEvents = [JSON.parse(e.data as string) as ChatEvent].concat(sseEvents);
            setChatEvents(sseEvents);
        };
        sse.onerror = () => {
            setError(true);
            sse.close();
        };
        return () => {
            sse.close();
        };
    }, [props.login]);

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
