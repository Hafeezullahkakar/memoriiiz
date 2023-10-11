import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useDispatch } from "react-redux";
import { setUserAndToken } from "../../redux/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const [error, serError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios
        .post("https://memoriiiz.vercel.app/user/login", formData)
        // .post("http://localhost:3001/user/login", formData)
        .then((res) => {
          const token = res?.data?.token;
          const user = res?.data?.user;
          // Dispatch the action to store user and token in Redux state
          dispatch(setUserAndToken({ user, token }));

          // console.log("res: ", res);
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(res?.data?.user));
          toast.success("logged in successfully!");
          navigate("/");
        });
    } catch (error) {
      serError(error?.response?.data?.msg);
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="loginPage">
      <form onSubmit={handleLogin}>
        <h3>Sign In</h3>

        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <p className="forgot-password text-left py-2">
          not registered with us?
          <Link to="/signup" className="mx-2">
            sign up
          </Link>
        </p>

        <p className="text-red-200" style={{color:'red'}}>{error ? error : ""}</p>
        <div className="d-grid">
          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </div>
        <p className="forgot-password text-right">
          Forgot <a href="#">password?</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
