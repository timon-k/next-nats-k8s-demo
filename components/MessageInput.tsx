import { Dispatch, ReactElement, SetStateAction, useState } from "react";
import { LoginData } from "../modules/LoginData";
import { Message } from "../modules/Message";

function postMessage(
    login: LoginData,
    message: string,
    textfieldSetter: Dispatch<SetStateAction<string>>,
) {
    const messageObject: Message = {
        username: login.username,
        message: message,
        type: "message",
    };

    return fetch(`./api/${login.chatroom}`, {
        method: "POST",
        body: JSON.stringify(messageObject),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            if (response.status >= 200 && response.status < 300) {
                textfieldSetter("");
            } else {
                console.log("Submitting new message failed, please retry.");
            }
        })
        .catch((err) => err);
}

export default function MessageInput(props: { login: LoginData }): ReactElement {
    const [newMessage, setNewMessage] = useState<string>("");

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                postMessage(props.login, newMessage, setNewMessage);
            }}
        >
            <input
                type="text"
                name="new_message"
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message"
                value={newMessage}
            />{" "}
            <input type="submit" value="Submit" />
        </form>
    );
}
