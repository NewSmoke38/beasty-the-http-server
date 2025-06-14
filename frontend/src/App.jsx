import { useState, useRef, useEffect } from 'react';
import './App.css';

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

  return (
    <div className="binsider-bg">
      {/* Top bar with tabs and path */}
      <div className="binsider-topbar">
        <span className="binsider-tabs">
          <span className="binsider-tab binsider-tab-active">Main</span>
          <span className="binsider-tab">DNA</span>
          <span className="binsider-tab">Logs</span>
          <span className="binsider-tab">Lore</span>
        </span>
        <span className="binsider-title-version">0.1.0</span>
        <span className="binsider-auth-btns">
          <button className="binsider-btn" onClick={() => setShowRegister(true)}>Register</button>
          <button className="binsider-btn" onClick={() => setShowLogin(true)}>Login</button>
        </span>
      </div>
      {/* Main content */}
      <div className="binsider-mainbox">
        <div className="binsider-center-content">
          <div className="binsider-logo pixel-font">beasty<span className="binsider-dot">.</span></div>
          <div className="binsider-desc">An HTTP server built from scratch.</div>
          <div className="binsider-desc binsider-desc-secondary">No frameworks. No shortcuts. Just raw code.</div>
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
        <div className="binsider-info-merged-box terminal-box">
          <div className="terminal-line">
            <span className="terminal-user">beasty@server</span>:<span className="terminal-path">~$</span>
            <span className="terminal-cursor">&nbsp;</span>
          </div>
        </div>
        {/* Footer navigation hints */}
        <div className="binsider-footer-nav">
          <span className="binsider-footer-hint binsider-footer-orange">[Enter→</span>Analyze library<span className="binsider-footer-hint">]</span>
          <span className="binsider-footer-hint">[o→</span>Open Documentation<span className="binsider-footer-hint">]</span>
          <span className="binsider-footer-hint">[Tab→</span>Next<span className="binsider-footer-hint">]</span>
          <span className="binsider-footer-hint binsider-footer-yellow">[Bksp→</span>Back<span className="binsider-footer-hint">]</span>
          <span className="binsider-footer-hint binsider-footer-red">[q→</span>Quit<span className="binsider-footer-hint">]</span>
        </div>
      </div>
      {/* Modals for Register and Login */}
      {showRegister && (
        <div className="binsider-modal">
          <div className="binsider-modal-content">
            <span className="binsider-modal-close" onClick={() => setShowRegister(false)}>&times;</span>
            <h2>Register</h2>
            <form>
              <input className="binsider-input" type="text" placeholder="Full Name" />
              <input className="binsider-input" type="text" placeholder="Username" />
              <input className="binsider-input" type="email" placeholder="Email" />
              <input className="binsider-input" type="password" placeholder="Password" />
              <button className="binsider-btn" type="submit">Register</button>
            </form>
          </div>
        </div>
      )}
      {showLogin && (
        <div className="binsider-modal">
          <div className="binsider-modal-content">
            <span className="binsider-modal-close" onClick={() => setShowLogin(false)}>&times;</span>
            <h2>Login</h2>
            <form>
              <input className="binsider-input" type="text" placeholder="Username or Email" />
              <input className="binsider-input" type="password" placeholder="Password" />
              <button className="binsider-btn" type="submit">Login</button>
            </form>
          </div>
        </div>
      )}
      {/* Made with love footer */}
      <div className="beasty-footer-love">[with <span className="binsider-heart">♥</span> by <span className="binsider-author">chxshi</span>]</div>
    </div>
  );
}

export default App;
