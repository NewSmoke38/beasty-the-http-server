import React, { useState } from 'react';
import { authAPI } from '../services/api';

const RegisterModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // checking if  passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // also for password length
    if (formData.password.length < 6 || formData.password.length > 8) {
      setError('Password must be between 6 and 8 characters');
      setLoading(false);
      return;
    }

    if (formData.username.length > 15) {
      setError('Username must be less than 15 characters');
      setLoading(false);
      return;
    }

    if (formData.fullName.length > 15) {
      setError('Full name must be less than 15 characters');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authAPI.register(registerData);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="binsider-modal">
      <div className="binsider-modal-content">
        <span className="binsider-modal-close" onClick={onClose}>&times;</span>
        <h2>Register</h2>
        {error && <div className="binsider-error">{error}</div>}
        {success && <div className="binsider-success">Registration successful! Redirecting...</div>}
        <form onSubmit={handleSubmit} id="register-form">
          <input
            className="binsider-input"
            id="register-fullname"
            name="fullName"
            type="text"
            placeholder="Full Name (max 15 chars)"
            value={formData.fullName}
            onChange={handleChange}
            required
            disabled={loading || success}
            maxLength={15}
          />
          <input
            className="binsider-input"
            id="register-username"
            name="username"
            type="text"
            placeholder="Username (max 15 chars)"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading || success}
            maxLength={15}
          />
          <input
            className="binsider-input"
            id="register-email"
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading || success}
          />
          <input
            className="binsider-input"
            id="register-password"
            name="password"
            type="password"
            placeholder="Password (6-8 chars)"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading || success}
            minLength={6}
            maxLength={8}
          />
          <input
            className="binsider-input"
            id="register-confirm-password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading || success}
            minLength={6}
            maxLength={8}
          />
          <button 
            className="binsider-btn"
            type="submit" 
            id="register-submit"
            disabled={loading || success}
          >
            {loading ? 'Registering...' : success ? 'Success!' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
