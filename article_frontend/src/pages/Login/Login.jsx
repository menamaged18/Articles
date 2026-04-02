import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../../store/slices/usersSlice"; 
import "./LoginStyle.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const dispatch = useDispatch();
  // Extract state from Redux
  const { loading, error, token } = useSelector((state) => state.users);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  // Redirect if login is successful
  if (token) {
    navigate("/");
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Display Error Message */}
          {error && <div className="error-banner" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <div className="label-row">
              <label>Password</label>
              <a href="/forgot" className="forgot-link">Forgot?</a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <a href="/signup">Create one</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;