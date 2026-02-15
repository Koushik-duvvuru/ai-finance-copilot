import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.access_token);

      navigate("/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: "#1e293b",
          padding: "40px",
          borderRadius: "15px",
          width: "350px",
        }}
      >
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            marginTop: "15px",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            color: "black",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            marginTop: "15px",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            color: "black",
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "10px",
            background: "#7c3aed",
            border: "none",
            borderRadius: "8px",
            color: "white",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
