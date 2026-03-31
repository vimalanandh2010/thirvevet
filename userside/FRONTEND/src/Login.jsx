import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, Eye, EyeOff } from './Icons';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Login({ onBack, onSignUp, onAuthSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Store JWT token
        localStorage.setItem('thrivevet_token', data.token);
        localStorage.setItem('thrivevet_user', JSON.stringify(data.user));
        
        alert('Login successful!');
        onAuthSuccess(data.user);
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login fetch error:', err);
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
            <h1>Welcome Back</h1>
            <p>Log in to your ThriveVet account</p>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
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
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  name="password" 
                  className="password-field"
                  placeholder="Enter your password" 
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

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Logging In...' : 'Log In'} <ArrowRight size={20} style={{ marginLeft: '10px' }} />
            </button>
          </form>

          <div className="signup-footer">
            <p>Don't have an account? <button onClick={onSignUp} className="link-btn">Sign Up</button></p>
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

export default Login;
