import * as React from "react";
import { ReactElement, useEffect } from "react";
import { LoginData } from "../modules/LoginData";
import { Message } from "../modules/Message";

export default function ChatMessages(props: { login: LoginData }): ReactElement {
    const [messages, setMessages] = React.useState([] as Message[]);
    const [error, setError] = React.useState(false);

    useEffect(() => {
        const sse = new EventSource(`./api/${props.login.chatroom}`);
        let sseMessages: Message[] = [];

        sse.onmessage = (e) => {
            sseMessages = [JSON.parse(e.data as string) as Message].concat(sseMessages);
            setMessages(sseMessages);
        };
        sse.onerror = () => {
            setError(true);
            sse.close();
        };
        return () => {
            sse.close();
        };
    }, [props.login.chatroom]);

    if (error) {
        return <div>Could not connect to server</div>;
    } else if (messages.length > 0) {
        return (
            <div>
                {messages.map((item) => (
                    <>
                        <i>{item.username}</i> {item.message} <br />
                    </>
                ))}
            </div>
        );
    } else {
        return <div>&lt;None&gt;</div>;
    }
}
