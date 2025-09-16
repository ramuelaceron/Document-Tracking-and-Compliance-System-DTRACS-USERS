// src/pages/Register/RegisterSchool.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterSchool.css";
import background from "../../assets/images/Start-Up.png";
import ParticleBackground from "../../components/ParticleBackground/Particle2.jsx";
import "../../components/ParticleBackground/Particle2.css";
import logo from "../../assets/images/logo-w-text.png";
import api from "../../api/axios";
import { schoolAddresses } from "../../data/schoolAddresses";
import { checkIfUserExists } from "../../utils/checkIfUserExists";

const RegisterSchool = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    contactNumber: "",
    school: "",
    school_address: "",
    position: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ Strict Email Validator
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;

    const domain = email.split('@')[1];
    if (!domain) return false;

    const tld = domain.split('.').pop();
    if (!tld || tld.length < 2) return false;

    const invalidTlds = ['co', 'c', 'coo', 'comm', 'gamil', 'gmial', 'gmaul', 'con', 'cm', 'netco'];
    if (invalidTlds.includes(tld.toLowerCase())) return false;

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "school") {
      const address = schoolAddresses[value] || "Address not available";
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        school_address: address,
      }));
    } else if (name === "contactNumber") {
      const numbersOnly = value.replace(/[^0-9]/g, "");
      if (numbersOnly.length <= 11) {
        setFormData((prev) => ({ ...prev, [name]: numbersOnly }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEmailBlur = () => {
    if (formData.email && !isValidEmail(formData.email)) {
      setError("Please enter a valid email address (e.g., user@gmail.com).");
    } else {
      if (error.includes("valid email")) setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // ✅ Validate email format
    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address (e.g., user@gmail.com).");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      let alreadyExists;
      try {
        alreadyExists = await checkIfUserExists(formData.email);
      } catch (checkError) {
        setError("Unable to verify email availability. Please check your connection and try again.");
        return;
      }

      if (alreadyExists) {
        setError("This email is already registered. Please log in or use a different email address.");
        return;
      }

      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        middle_name: formData.middleName || "",
        school_name: formData.school,
        school_address: formData.school_address,
        position: formData.position,
        email: formData.email,
        contact_number: formData.contactNumber,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        registration_date: new Date().toISOString(),
        active: false,
        avatar: "",
      };

      await api.post("/school/account/request", payload);
      setSuccess("Registration successful! Awaiting verification.");

      setTimeout(() => {
        navigate("/login/school");
      }, 2000);
    } catch (err) {
      console.error(err);
      let errorMsg = "Registration failed. Please try again.";
      if (err.response?.data?.detail) {
        const d = err.response.data.detail;
        if (typeof d === "string") {
          errorMsg = d;
        } else if (Array.isArray(d)) {
          errorMsg = d.map((e) => e.msg || "Invalid input").join(" • ");
        }
      } else if (!err.response) {
        errorMsg = "Network error. Check your connection.";
      }
      setError(errorMsg);
    }
  };

  const handleLoginClick = () => navigate("/login/school");
  const handleLogoClick = () => navigate("/");

  return (
    <div className="register-school-page">
      <div className="school-background-image">
        <img src={background} alt="DepEd Biñan City Building" />
      </div>

      <div className="school-blue-overlay">
        <ParticleBackground />
        <div className="rs-form-container">
          <div className="rs-header">
            <div className="rs-logo-container" onClick={handleLogoClick}>
              <img src={logo} className="logo-w-text" alt="Logo" />
            </div>
            <p className="rs-subtitle">
              Please fill up information below to register.
            </p>
          </div>

          {error && (
            <div className="rs-error">
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="rs-success">
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="rs-form">
            {/* Name Fields */}
            <div className="rs-form-group">
              <label className="rs-form-label">Name</label>
              <div className="rs-name-inputs">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  className="rs-name-input"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  className="rs-name-input"
                  required
                />
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  placeholder="Middle name"
                  className="rs-name-input"
                />
              </div>
            </div>

            {/* Email */}
            <div className="rs-form-group">
              <label className="rs-form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleEmailBlur}
                placeholder="Enter your email"
                className="rs-name-input"
                required
              />
            </div>

            {/* Contact Number */}
            <div className="rs-form-group">
              <label className="rs-form-label">Contact Number</label>
              <div className="rs-phone-input-container">
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Enter your contact number"
                  className="rs-phone-input"
                  required
                  pattern="[0-9]{11}"
                  inputMode="numeric"
                  minLength="11"
                  maxLength="11"
                />
              </div>
            </div>

            {/* School */}
            <div className="rs-form-group">
              <label className="rs-form-label">School</label>
              <select
                name="school"
                value={formData.school}
                onChange={handleChange}
                className="rs-form-input"
                required
              >
                <option value="">Select your school</option>
                {Object.keys(schoolAddresses).map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
            </div>

            {/* Position */}
            <div className="rs-form-group">
              <label className="rs-form-label">Position</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="rs-form-input"
                required
              >
                <option value="">Select your position</option>
                <option value="Teacher">Teacher</option>
                <option value="Principal">Principal</option>
              </select>
            </div>

            {/* Password */}
            <div className="rs-form-group">
              <label className="rs-form-label">Password</label>
              <div className="rs-password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="rs-form-input"
                  required
                />
                <button
                  type="button"
                  className="rs-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="rs-form-group">
              <label className="rs-form-label">Confirm Password</label>
              <div className="rs-password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="rs-form-input"
                  required
                />
                <button
                  type="button"
                  className="rs-toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" className="rs-register-button">
              Register
            </button>
          </form>

          <div className="rs-login-prompt">
            Already have an account?{" "}
            <span className="rs-login-link" onClick={handleLoginClick}>
              Log in
            </span>
          </div>

          <div className="rs-privacy-notice">
            <p>
              By using this service, you understand and agree to the DepEd
              Online Services{" "}
              <a href="#terms" className="rs-privacy-link">
                Terms of Use
              </a>{" "}
              and{" "}
              <a href="#privacy" className="rs-privacy-link">
                Privacy Statement
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterSchool;