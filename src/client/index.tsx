import { createRoot } from "react-dom/client";
import { usePartySocket } from "partysocket/react";
import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate
} from "react-router";
import { nanoid } from "nanoid";

import { names, type ChatMessage, type Message } from "../shared";
interface LoginProps {
  onLogin: (user: { email: string; roomname: string; displayName: string }) => void;
}
const params = useParams();

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [roomname, setroomname] = useState("");
  const [displayName, setDisplayName] = useState("");
  const navigate = useNavigate();
  
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ email, roomname, displayName });
    //navigate(`/${roomname}`); // Go to room URL dynamically
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <input
        placeholder="Room name to join"
        type="text"
        value={params.room}
        onChange={(e) => setroomname(e.target.value)}
      />
      <input
        placeholder="Display Name"
        type="text"
        value={localStorage.getItem("displayName")}
        onChange={(e) => setDisplayName(e.target.value)}
      />
      <button type="submit">Enter</button>
    </form>
  );
}
function doNothingFunction() {
        // This function does nothing
}
function RootApp() {
  const [user, setUser] = useState<{
    email: string;
    roomname: string;
    displayName: string;
  } | null>(null);

  return (
    <Routes>
      <Route
        path="/"
        element={<Login onLogin={setUser} />}
      />
      <Route
        path="/:room"
        element={
          user ? (
            <App user={user} />
          ) : (
            //<Navigate to="/" />
            doNothingFunction()
          )
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}


function App({ user }: { user: { email: string; roomname: string; displayName: string } }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { room } = useParams();
  localStorage.setItem("displayName", user.displayName);
  const socket = usePartySocket({
    party: "chat",
    room,
    onMessage: (evt) => {
      const message = JSON.parse(evt.data as string) as Message;
      if (user.displayName === "") {
        alert("Blank display names are not allowed!")
        location.reload()
      }
      if (message.type === "add") {
        
        const foundIndex = messages.findIndex((m) => m.id === message.id);
        if (foundIndex === -1) {
          // probably someone else who added a message
          setMessages((messages) => [
            ...messages,
            {
              id: message.id,
              content: message.content,
              user: message.user,
              role: message.role,
            },
          ]);
        } else {
          // this usually means we ourselves added a message
          // and it was broadcasted back
          // so let's replace the message with the new message
          setMessages((messages) => {
            return messages
              .slice(0, foundIndex)
              .concat({
                id: message.id,
                content: message.content,
                user: message.user,
                role: message.role,
              })
              .concat(messages.slice(foundIndex + 1));
          });
        }
      } else if (message.type === "update") {
        setMessages((messages) =>
          messages.map((m) =>
            m.id === message.id
              ? {
                  id: message.id,
                  content: message.content,
                  user: message.user,
                  role: message.role,
                }
              : m,
          ),
        );
      } else {
        setMessages(message.messages);
      }
    },
  });

  return (
    <div className="chat container">
      {messages.map((message) => (
        <div key={message.id} className="row message">
          <div className="two columns user">{message.user}</div>
          <div className="ten columns">{message.content}</div>
        </div>
      ))}
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          const content = e.currentTarget.elements.namedItem(
            "content",
          ) as HTMLInputElement;
          const chatMessage: ChatMessage = {
            id: nanoid(8),
            content: content.value,
            user: user.displayName,
            role: "user",
          };
          setMessages((messages) => [...messages, chatMessage]);
          // we could broadcast the message here

          socket.send(
            JSON.stringify({
              type: "add",
              ...chatMessage,
            } satisfies Message),
          );

          content.value = "";
        }}
      >
        <input
          type="text"
          name="content"
          className="ten columns my-input-text"
          placeholder={`Hello ${user.displayName}! Type a message...`}
          autoComplete="off"
        />
        <button type="submit" className="send-message two columns">
          Send
        </button>
      </form>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <RootApp />
  </BrowserRouter>
);

