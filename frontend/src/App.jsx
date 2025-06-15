import { useState, useRef, useEffect } from 'react';
import './App.css';
import RegisterModal from './components/registerModal';
import { authAPI } from './services/api';

const HTTP_OPTIONS = [
  'GET /status',
  'GET /logs',
  'POST /login',
  'POST /register',
  'GET /dna',
  'GET /lore',
];

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [httpOption, setHttpOption] = useState(HTTP_OPTIONS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Login form submitted');
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    console.log('Login attempt with:', { email, password: '***' });
    
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      console.log('Login response:', response);
      
      if (response.success) {
        console.log('Login successful');
        setShowLogin(false);
        // You might want to update the UI to show the user is logged in
      } else {
        console.log('Login failed:', response.message);
        setLoginError(response.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.data?.message) {
        setLoginError(err.response.data.message);
      } else if (err.message) {
        setLoginError(err.message);
      } else {
        setLoginError('Login failed. Please try again.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="beasty-bg">
      {/* Top bar with tabs and path */}
      <div className="beasty-topbar">
        <span className="beasty-tabs">
          <span className="beasty-tab beasty-tab-active">Main</span>
          <span className="beasty-tab">DNA</span>
          <span className="beasty-tab">Logs</span>
          <span className="beasty-tab">Lore</span>
        </span>
        <span className="beasty-auth-btns">
          <button className="beasty-btn" onClick={() => setShowRegister(true)}>Register</button>
          <button className="beasty-btn" onClick={() => setShowLogin(true)}>Login</button>
        </span>
      </div>
      {/* Main content */}
      <div className="beasty-mainbox">
        <div className="beasty-center-content">
          <div className="beasty-logo pixel-font">
            beasty<span className="beasty-dot">.</span>
          </div>
          <div className="beasty-desc">A HTTP server built from scratch.</div>
          <div className="beasty-desc beasty-desc-secondary">No frameworks. No shortcuts. Just raw code.</div>
          <div className="beasty-info-blue">You can only make 4 requests. Use them wisely.</div>
        </div>
        {/* Custom HTTP dropdown field */}
        <div className="custom-dropdown-container" ref={dropdownRef}>
          <div 
            className="custom-dropdown-header"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>{httpOption}</span>
            <span className={`custom-dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
          </div>
          {isDropdownOpen && (
            <div className="custom-dropdown-list">
              {HTTP_OPTIONS.map((option) => (
                <div
                  key={option}
                  className={`custom-dropdown-item ${option === httpOption ? 'selected' : ''}`}
                  onClick={() => {
                    setHttpOption(option);
                    setIsDropdownOpen(false);
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Terminal-like merged info box (now just prompt and cursor) */}
        <div className="beasty-info-merged-box terminal-box">
          <div className="terminal-line">
            <span className="terminal-user">beasty@server</span>:<span className="terminal-path">~$</span>
            <span className="terminal-cursor">&nbsp;</span>
          </div>
        </div>
        {/* Footer navigation hints */}
        <div className="beasty-footer-nav">
          <button className="beasty-send-btn" onClick={() => console.log('Sending request:', httpOption)}>
            <span className="beasty-footer-hint beasty-footer-orange">[Enter→</span>Send<span className="beasty-footer-hint">]</span>
          </button>
          <span className="beasty-footer-hint">[Open→</span><a href="/docs" className="beasty-doc-link">Documentation</a><span className="beasty-footer-hint">]</span>
        </div>
      </div>
      {/* Modals for Register and Login */}
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
      {showLogin && (
        <div className="beasty-modal">
          <div className="beasty-modal-content">
            <span className="beasty-modal-close" onClick={() => setShowLogin(false)}>&times;</span>
            <h2>Login</h2>
            {loginError && <div className="beasty-error">{loginError}</div>}
            <form onSubmit={handleLogin}>
              <input 
                className="beasty-input" 
                type="email" 
                name="email"
                placeholder="Email" 
                required
                disabled={loginLoading}
              />
              <input 
                className="beasty-input" 
                type="password" 
                name="password"
                placeholder="Password" 
                required
                disabled={loginLoading}
              />
              <button 
                className="beasty-btn" 
                type="submit"
                disabled={loginLoading}
              >
                {loginLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Made with love footer */}
      <div className="beasty-footer-love">[with <span className="beasty-heart">♥</span> by <span className="beasty-author">chxshi</span>]</div>
    </div>
  );
}

export default App;
