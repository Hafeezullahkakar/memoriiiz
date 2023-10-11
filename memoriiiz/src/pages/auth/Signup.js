import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios to make HTTP requests
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("formdata: ", formData);

    try {
      const response = await axios
        .post("https://memoriiiz.vercel.app/user/register", formData)
        // .post("http://localhost:3001/user/register", formData)
        .then((res) => {
          toast.success("signed up successfully!");
          navigate("/login");
        });
      // console.log("User registered successfully!", response.data);
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  useEffect(() => {
    // This will run when the component mounts
    // You can use it for any initialization or side effects
  }, []);

  return (
    <div className="signupPage">
      <form onSubmit={handleSubmit}>
        <h3>Sign Up</h3>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            required
            type="email"
            className="form-control"
            placeholder="Enter email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            required
            className="form-control"
            placeholder="Enter Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            name="password"
            value={formData.password}
            required
            onChange={handleChange}
          />
        </div>
        <div className="d-grid">
          <button type="submit" className="btn btn-primary">
            Sign Up
          </button>
        </div>
        <p className="forgot-password text-right">
          Already registered <Link to="/login">sign in?</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
