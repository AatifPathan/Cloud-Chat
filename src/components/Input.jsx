import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import {
  arrayUnion,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuid } from "uuid";

const Input = () => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const handleSend = async () => {
    if (!text.trim() || !data?.chatId || !data?.user?.uid) {
      setError("Cannot send an empty message or no chat selected.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const messageData = {
        id: uuid(),
        text: text.trim(),
        senderId: currentUser.uid,
        date: Timestamp.now(),
      };

      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion(messageData),
      });

      await updateUserChats(text.trim());
      finishSend();
    } catch (err) {
      console.error("Send failed:", err);
      setError("Failed to send message.");
      setSending(false);
    }
  };

  const updateUserChats = async (messageText) => {
    const updates = {
      [data.chatId + ".lastMessage"]: {
        text: messageText,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    };

    await Promise.all([
      updateDoc(doc(db, "userChats", currentUser.uid), updates),
      updateDoc(doc(db, "userChats", data.user.uid), updates),
    ]);
  };

  const finishSend = () => {
    setText("");
    setSending(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input">
      <input
        type="text"
        placeholder="Type something..."
        onChange={(e) => setText(e.target.value)}
        onKeyPress={handleKeyPress}
        value={text}
        disabled={sending}
      />
      <div className="send">
        <button onClick={handleSend} disabled={sending}>
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Input;