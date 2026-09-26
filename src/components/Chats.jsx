import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";

const Chats = () => {
  const [chats, setChats] = useState({});

  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (docSnap) => {
      setChats(docSnap.data() || {});
    });

    return () => unsub();
  }, [currentUser?.uid]);

  const handleSelect = (userInfo) => {
    dispatch({ type: "CHANGE_USER", payload: userInfo });
  };

  // Function to generate initials from a name
  const getInitials = (name) => {
    if (!name) return "?";
    
    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    // Take first letter of first and last word
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  // Function to generate consistent color based on name
  const getAvatarColor = (name) => {
    if (!name) return "#6b7280"; // Default gray
    
    const colors = [
      "#ef4444", // red
      "#f97316", // orange
      "#eab308", // yellow
      "#22c55e", // green
      "#06b6d4", // cyan
      "#3b82f6", // blue
      "#8b5cf6", // violet
      "#ec4899", // pink
      "#10b981", // emerald
      "#f59e0b", // amber
    ];
    
    // Generate consistent color based on name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Avatar component
  const Avatar = ({ name, size = "50px" }) => {
    const initials = getInitials(name);
    const backgroundColor = getAvatarColor(name);
    
    return (
      <div
        className="avatar"
        style={{
          width: size,
          height: size,
          backgroundColor: backgroundColor,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          fontSize: size === "50px" ? "18px" : "16px",
          fontWeight: "600",
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
    );
  };

  return (
    <div className="chats">
      {Object.entries(chats).length === 0 ? (
        <div className="noChats">
          <p>No recent chats found.</p>
        </div>
      ) : (
        Object.entries(chats)
          .sort((a, b) => b[1].date - a[1].date)
          .map(([chatId, chat]) => (
            <div
              className="userChat"
              key={chatId}
              onClick={() => handleSelect(chat.userInfo)}
            >
              <Avatar name={chat.userInfo?.displayName || "Unknown User"} />
              <div className="userChatInfo">
                <span>{chat.userInfo?.displayName || "Unknown User"}</span>
                <p>{chat.lastMessage?.text || "No messages yet"}</p>
              </div>
            </div>
          ))
      )}
    </div>
  );
};

export default Chats;
