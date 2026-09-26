import React, { useContext, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";

const Search = () => {
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const { currentUser } = useContext(AuthContext);

  const handleSearch = async () => {
    if (!username.trim()) return;

    setLoading(true);
    setErr(false);
    setUsers([]);

    const q = query(
      collection(db, "users"),
      where("displayName", "==", username)
    );

    try {
      const querySnapshot = await getDocs(q);
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push(doc.data());
      });

      if (results.length === 0) setErr(true);
      setUsers(results);
    } catch (err) {
      console.error("Search failed:", err);
      setErr(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.code === "Enter") {
      handleSearch();
    }
  };

  const handleSelect = async (user) => {
    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;

    try {
      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL || null,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", user.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL || null,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("Chat setup failed:", err);
      setErr(true);
    }

    setUsers([]);
    setUsername("");
  };

  return (
    <div className="search">
      <div className="searchForm">
        <input
          type="text"
          placeholder="Find a user"
          onKeyDown={handleKey}
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
      </div>

      {loading && <span>Searching...</span>}
      {err && !loading && <span>User not found!</span>}

      {users.map((user) => (
        <div className="userChat" key={user.uid} onClick={() => handleSelect(user)}>
          <img
            src={user.photoURL || "/default-user.png"}
            alt={`${user.displayName}'s avatar`}
          />
          <div className="userChatInfo">
            <span>{user.displayName}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Search;