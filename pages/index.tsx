import { ReactElement, useState } from "react";
import ChatMessages from "../components/ChatMessages";

type LoginData = {
    username: string | undefined;
    chatroom: string | undefined;
};

export default function HomePage(): ReactElement {
    const [loginData, setLoginData] = useState<LoginData>({
        username: undefined,
        chatroom: undefined,
    });

    const [username, setUsername] = useState<string>("");
    const [chatroom, setChatroom] = useState<string>("");

    if (loginData.username) {
        return (
            <div>
                <h1>
                    Welcome to chatroom {loginData.chatroom}, {loginData.username}!
                </h1>
                <ChatMessages />
            </div>
        );
    } else {
        return (
            <form onSubmit={() => setLoginData({ username: username, chatroom: chatroom })}>
                <h1>Log In</h1>
                <p>
                    <input
                        type="text"
                        name="username"
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        value={username}
                    />
                </p>
                <p>
                    <input
                        type="text"
                        name="chatroom"
                        onChange={(e) => setChatroom(e.target.value)}
                        placeholder="Chatroom"
                        value={chatroom}
                    />
                </p>
                <p>
                    <input type="submit" value="Submit" />
                </p>
            </form>
        );
    }
}
