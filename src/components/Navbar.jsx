import React, { useContext } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Failed to logout. Please try again.");
    }
  };

  return (
    <div className="navbar">
      <span className="logo">Cloud Chat</span>
      {currentUser ? (
        <div className="user">
          <img
            src={currentUser.photoURL || "/default-user.png"}
            alt={`${currentUser.displayName}'s avatar`}
          />
          <span>{currentUser.displayName || "User"}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div className="user">
          <span>Loading...</span>
        </div>
      )}
    </div>
  );
};

export default Navbar;
