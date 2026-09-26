import React, { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const Message = ({ message }) => {
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const ref = useRef();

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

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
  const Avatar = ({ name, size = "40px" }) => {
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
          fontSize: size === "40px" ? "14px" : "16px",
          fontWeight: "600",
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
    );
  };

  const formatTimestamp = (timestamp) => {
    console.log('Timestamp received:', timestamp, 'Type:', typeof timestamp);
    
    if (!timestamp) {
      return 'just now';
    }
    
    try {
      let date;
      
      // Handle Firestore Timestamp
      if (timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      }
      // Handle Firestore Timestamp with seconds/nanoseconds
      else if (timestamp && timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      }
      // Handle regular Date or timestamp number
      else {
        date = new Date(timestamp);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log('Invalid date created from:', timestamp);
        return 'just now';
      }
      
      const now = new Date();
      const diffInMilliseconds = now - date;
      const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
      const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
      
      console.log('Time diff - Minutes:', diffInMinutes, 'Hours:', diffInHours, 'Days:', diffInDays);
      
      if (diffInMinutes < 1) {
        return 'just now';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return date.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else {
        // Show day and time for anything older than 24 hours
        return date.toLocaleDateString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'just now';
    }
  };

  const isOwner = message.senderId === currentUser.uid;

  // Debug log to see what's in the message
  console.log('Message object:', message);

  return (
    <div ref={ref} className={`message ${isOwner ? "owner" : ""}`}>
      <div className="messageInfo">
        <Avatar 
          name={isOwner ? currentUser.displayName : data.user?.displayName}
        />
        <span>{formatTimestamp(message.date)}</span>
      </div>
      <div className="messageContent">
        {message.text && <p>{message.text}</p>}
        {message.img && (
          <img src={message.img} alt="Sent media" />
        )}
      </div>
    </div>
  );
};

export default Message;
