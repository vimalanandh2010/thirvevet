import React, { useState } from 'react';
import { ArrowRight, User, Phone, Mail, MapPin, Lock, Eye, EyeOff } from './Icons';
import Logo from './Logo';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Signup({ onBack, onLogin, onAuthSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          phone: formData.phone,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store JWT token
        localStorage.setItem('thrivevet_token', data.token);
        localStorage.setItem('thrivevet_user', JSON.stringify(data.user));

        alert('Signup successful! Redirecting...');
        onAuthSuccess(data.user);
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup fetch error:', err);
      setError('Could not connect to server. Ensure your backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="signup-page">
      <div className="signup-container fade-in">
        <div className="signup-card">
          <div className="signup-header">
            <div className="signup-logo-container">
              <img 
                src="/images/logo.png" 
                alt="ThriveVet Logo" 
                className="signup-logo-img" 
              />
            </div>
            <h1>Join ThriveVet</h1>
            <p>Empowering farmers with modern animal health solutions</p>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <User size={20} className="input-icon" />
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  placeholder="Enter your name" 
                  required 
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location Name</label>
              <div className="input-wrapper">
                <MapPin size={20} className="input-icon" />
                <input 
                  type="text" 
                  id="location" 
                  name="location" 
                  placeholder="e.g. Tamil Nadu, Salem" 
                  required 
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-wrapper">
                <Phone size={20} className="input-icon" />
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  placeholder="+91 XXXXX XXXXX" 
                  required 
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  placeholder="your@email.com" 
                  required 
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Create Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  name="password" 
                  className="password-field"
                  placeholder="Min. 8 characters" 
                  required 
                  value={formData.password}
                  onChange={handleChange}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  className="password-field"
                  placeholder="Repeat your password" 
                  required 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={20} style={{ marginLeft: '10px' }} />
            </button>
          </form>

          <div className="signup-footer">
            <p>Already have an account? <button onClick={onLogin} className="link-btn">Log In</button></p>
            <button onClick={onBack} className="btn-back">
              &larr; Back to Home
            </button>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
    </div>
  );
}

export default Signup;
