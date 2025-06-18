import React, { useState, useEffect, useRef } from 'react';
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
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: '#ff4b6e'
  });
  const [buttonText, setButtonText] = useState('Register');
  const timerRefs = useRef([]);

  const calculatePasswordStrength = (password) => {
    let score = 0;
    let message = '';
    let color = '#ff4b6e'; // Default red

    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[!@#$%^&*]/.test(password)) score += 1;
    if (password.length >= 12) score += 1;

    switch (score) {
      case 0:
        message = 'Very Weak';
        color = '#ff4b6e';
        break;
      case 1:
        message = 'Weak';
        color = '#ff6b6b';
        break;
      case 2:
        message = 'Fair';
        color = '#ffd93d';
        break;
      case 3:
        message = 'Good';
        color = '#6bff6b';
        break;
      case 4:
        message = 'Strong';
        color = '#4bff4b';
        break;
      case 5:
        message = 'Very Strong';
        color = '#00ff00';
        break;
      default:
        message = 'Very Weak';
        color = '#ff4b6e';
    }

    return { score, message, color };
  };

  const checkPasswordRequirements = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password)
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('Password must be at least 8 characters long');
    if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
    if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
    if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain at least one special character (!@#$%^&*)');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Register form submitted');
    
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join('\n'));
      return;
    }
    
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

  useEffect(() => {
    if (loading) {
      setButtonText('Registering...');
      timerRefs.current = [
        setTimeout(() => setButtonText('Weaving magic...'), 2000),
        setTimeout(() => setButtonText('Crafting your space...'), 4000),
        setTimeout(() => setButtonText('Adding sparkles...'), 6000),
        setTimeout(() => setButtonText('Tucking you in...'), 8000),
        setTimeout(() => setButtonText('Sprinkling stardust...'), 10000),
        setTimeout(() => setButtonText('Making it cozy...'), 12000),
        setTimeout(() => setButtonText('Almost ready...'), 14000),
        setTimeout(() => setButtonText('Final touches...'), 16000),
        setTimeout(() => setButtonText('Just a moment...'), 18000),
      ];
    } else {
      setButtonText('Register');
      timerRefs.current.forEach(clearTimeout);
      timerRefs.current = [];
    }
    return () => {
      timerRefs.current.forEach(clearTimeout);
      timerRefs.current = [];
    };
  }, [loading]);

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
          <div className="password-input-container">
            <input
              className="beasty-input"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              maxLength={32}
              required
              disabled={loading}
            />
            <div className="password-strength" style={{ color: passwordStrength.color }}>
              {formData.password && `Strength: ${passwordStrength.message}`}
            </div>
            <div className="password-requirements">
              <small>Password must contain:</small>
              <ul>
                <li className={formData.password.length >= 8 ? 'requirement-met' : ''}>
                  At least 8 characters
                </li>
                <li className={/[A-Z]/.test(formData.password) ? 'requirement-met' : ''}>
                  One uppercase letter
                </li>
                <li className={/[0-9]/.test(formData.password) ? 'requirement-met' : ''}>
                  One number
                </li>
                <li className={/[!@#$%^&*]/.test(formData.password) ? 'requirement-met' : ''}>
                  One special character (!@#$%^&*)
                </li>
              </ul>
            </div>
          </div>
          <input
            className="beasty-input"
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            minLength={8}
            maxLength={32}
            required
            disabled={loading}
          />
          <button 
            className="beasty-btn" 
            type="submit"
            disabled={loading || passwordStrength.score < 3}
          >
            {buttonText}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
