import React, { useState } from 'react';
import { authAPI } from '../services/api';

const LoginModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
       setError('');    // clear error when user types this is good
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      console.log('Login successful:', response);
          // store the token in localStorage for future use in beasty (so that we can inject auth bearer token automatically in the get reqs for merge box)
      localStorage.setItem('token', response.token);
      onClose(); // closes form on success
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="binsider-modal">
      <div className="binsider-modal-content">
        <h2>Login</h2>
        {error && <div className="binsider-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal; 