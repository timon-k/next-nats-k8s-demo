import * as React from "react";
import { ReactElement, useEffect } from "react";

type Message = {
  index: number;
  data: string;
};

export default () => {
  const [messages, setMessages] = React.useState([] as Message[]);
  const [error, setError] = React.useState(false);

  useEffect(() => {
    const sse = new EventSource("./api/spam");
    let sseMessages: Message[] = [];

    sse.onmessage = (e) => {
      sseMessages = sseMessages.concat([
        {
          index: sseMessages.length + 1,
          data: e.data as string,
        },
      ]);
      setMessages(sseMessages);
    };
    sse.onerror = () => {
      setError(true);
      sse.close();
    };
    return () => {
      sse.close();
    };
  }, []);

  if (error) {
    return <div>Could not connect to server</div>;
  } else if (messages.length > 0) {
    return (
      <ul>
        {messages.map((item) => (
          <li key={item.index}>{item.data}</li>
        ))}
      </ul>
    );
  } else {
    return <div>&lt;None&gt;</div>;
  }
};
