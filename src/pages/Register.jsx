import React, { useState } from "react";
import Add from "../img/addAvatar.png";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null); // Avatar preview

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];

    if (password.length < 8) {
      setErr(true);
      setLoading(false);
      alert("Password must be at least 8 characters long");
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      if (file) {
        const date = new Date().getTime();
        const storageRef = ref(storage, `${displayName + date}`);

        await uploadBytesResumable(storageRef, file).then(() => {
          getDownloadURL(storageRef).then(async (downloadURL) => {
            try {
              await updateProfile(res.user, {
                displayName,
                photoURL: downloadURL,
              });

              await setDoc(doc(db, "users", res.user.uid), {
                uid: res.user.uid,
                displayName,
                email,
                photoURL: downloadURL,
              });

              await setDoc(doc(db, "userChats", res.user.uid), {});
              navigate("/login"); // ✅ Redirect to login
            } catch (err) {
              console.log(err);
              setErr(true);
              setLoading(false);
            }
          });
        });
      } else {
        // No avatar file selected
        try {
          await updateProfile(res.user, {
            displayName,
          });

          await setDoc(doc(db, "users", res.user.uid), {
            uid: res.user.uid,
            displayName,
            email,
          });

          await setDoc(doc(db, "userChats", res.user.uid), {});
          navigate("/login"); // ✅ Redirect to login
        } catch (err) {
          console.log(err);
          setErr(true);
          setLoading(false);
        }
      }
    } catch (err) {
      setErr(true);
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">Cloud Chat</span>
        <span className="title">Register</span>
        <form onSubmit={handleSubmit}>
          <input required type="text" placeholder="Display Name" />
          <input required type="email" placeholder="Email" />
          <input required type="password" placeholder="Password (min 8 characters)" />
          <input
            style={{ display: "none" }}
            type="file"
            id="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          <label htmlFor="file" className="avatarLabel">
            <img src={preview || Add} alt="Avatar" />
            <span>{preview ? "Change avatar" : "Add an avatar"}</span>
          </label>
          <button disabled={loading}>Sign up</button>
          {loading && <p>Uploading and setting up your profile…</p>}
          {err && <span>Something went wrong</span>}
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
