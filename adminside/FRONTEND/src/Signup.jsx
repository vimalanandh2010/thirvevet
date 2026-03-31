import React, { useState } from 'react';
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff } from './Icons';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://thirvevet-1.onrender.com';

function Signup({ onBack, onLogin, onAuthSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          location: formData.location
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('thrivevet_admin_token', data.token);
        localStorage.setItem('thrivevet_admin_user', JSON.stringify(data.user));
        onAuthSuccess(data.user);
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Server connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="admin-login-container fade-in">
      <div className="admin-login-card" style={{ maxWidth: '500px' }}>
        <h1>Create Admin Account</h1>
        {error && <p className="error">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <input 
              type="text" 
              name="name"
              placeholder="Full Name" 
              required 
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <input 
              type="email" 
              name="email"
              placeholder="Admin Email" 
              required 
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <input 
              type="text" 
              name="phone"
              placeholder="Phone Number" 
              required 
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <input 
              type="text" 
              name="location"
              placeholder="Location" 
              required 
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                placeholder="Password" 
                required 
                value={formData.password}
                onChange={handleChange}
              />
              <button 
                type="button" 
                className="admin-password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <input 
              type="password" 
              name="confirmPassword"
              placeholder="Confirm Password" 
              required 
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up as Admin'}
          </button>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Already have an account? <button type="button" className="link-btn" onClick={onLogin} style={{ color: 'var(--primary)', fontWeight: '700', border: 'none', background: 'none', cursor: 'pointer' }}>Login</button>
            </p>
            <button type="button" className="btn-ghost w-full" style={{ marginTop: '1rem', border: 'none' }} onClick={onBack}>Back to Home</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;