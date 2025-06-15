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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Register form submitted');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      console.log('Sending registration data:', { ...formData, confirmPassword: '***' });
      const response = await authAPI.register(formData);
      console.log('Registration response:', response);
      
      if (response.success) {
        console.log('Registration successful');
        onClose();
      } else {
        console.log('Registration failed:', response.message);
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
    <div className="beasty-modal">
      <div className="beasty-modal-content">
        <span className="beasty-modal-close" onClick={onClose}>&times;</span>
        <h2>Register</h2>
        {error && <div className="beasty-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            className="beasty-input"
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            maxLength={15}
            required
            disabled={loading}
          />
          <input
            className="beasty-input"
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            maxLength={15}
            required
            disabled={loading}
          />
          <input
            className="beasty-input"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            className="beasty-input"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            minLength={6}
            maxLength={8}
            required
            disabled={loading}
          />
          <input
            className="beasty-input"
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            minLength={6}
            maxLength={8}
            required
            disabled={loading}
          />
          <button 
            className="beasty-btn" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
