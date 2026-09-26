import React, { useContext } from "react";
import Messages from "./Messages";
import Input from "./Input";
import { ChatContext } from "../context/ChatContext";

const Chat = () => {
  const { data } = useContext(ChatContext);
  const userSelected = !!data.user?.uid;

  return (
    <div className="chat">
      <div className="chatInfo">
        <span>
          {userSelected ? data.user.displayName : "Select a user to start chat"}
        </span>
      </div>

      {userSelected ? (
        <>
          <Messages />
          <Input />
        </>
      ) : (
        <div className="noChatSelected">
          <p>Please select a chat from the left panel</p>
        </div>
      )}
    </div>
  );
};

export default Chat;