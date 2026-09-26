import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";
import Message from "./Message";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const { data } = useContext(ChatContext);

  useEffect(() => {
    if (!data.chatId) return;

    const unSub = onSnapshot(doc(db, "chats", data.chatId), (docSnap) => {
      docSnap.exists() && setMessages(docSnap.data().messages || []);
    });

    return () => unSub();
  }, [data.chatId]);

  return (
    <div className="messages">
      {messages.length === 0 ? (
        <p className="noMessages">No messages yet. Start the conversation!</p>
      ) : (
        messages.map((m) => <Message message={m} key={m.id} />)
      )}
    </div>
  );
};

export default Messages;
