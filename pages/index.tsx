import { ReactElement, useState } from "react";
import ChatMessages from "../components/ChatMessages";
import MessageInput from "../components/MessageInput";
import { LoginData } from "../modules/LoginData";

export default function HomePage(): ReactElement {
    const [loginData, setLoginData] = useState<LoginData | undefined>(undefined);

    const [username, setUsername] = useState<string>("");
    const [chatroom, setChatroom] = useState<string>("");
    const isValidLoginData = username && chatroom;

    if (loginData) {
        return (
            <div>
                <h1>
                    Welcome to chatroom {loginData.chatroom}, {loginData.username}! (
                    <button onClick={() => setLoginData(undefined)}>Logout</button>)
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
                {/* Autofill has to be turned off, otherwise the onChange is not reliably triggered.
                 *
                 * https://stackoverflow.com/q/55244590
                 */}
                <h1>Log In</h1>
                <p>
                    <input
                        type="search"
                        name="username"
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        value={username}
                        autoComplete="off"
                    />
                </p>
                <p>
                    <input
                        type="search"
                        name="chatroom"
                        onChange={(e) => setChatroom(e.target.value)}
                        placeholder="Chatroom"
                        value={chatroom}
                        autoComplete="off"
                    />
                </p>
                <p>
                    <input type="submit" value="Submit" disabled={!isValidLoginData} />
                </p>
            </form>
        );
    }
}
