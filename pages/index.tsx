import { ReactElement, useState } from "react";
import ChatMessages from "../components/ChatMessages";
import MessageInput from "../components/MessageInput";
import { LoginData } from "../modules/LoginData";

export default function HomePage(): ReactElement {
    const undefinedLoginData = { username: undefined, chatroom: undefined };
    const [loginData, setLoginData] = useState<LoginData>(undefinedLoginData);

    const [username, setUsername] = useState<string>("");
    const [chatroom, setChatroom] = useState<string>("");

    if (loginData.username) {
        return (
            <div>
                <h1>
                    Welcome to chatroom {loginData.chatroom}, {loginData.username}! (
                    <button onClick={() => setLoginData(undefinedLoginData)}>Logout</button>)
                </h1>
                <MessageInput login={loginData} />
                <p></p>
                <ChatMessages login={loginData} />
            </div>
        );
    } else {
        return (
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setLoginData({ username: username, chatroom: chatroom });
                }}
            >
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
