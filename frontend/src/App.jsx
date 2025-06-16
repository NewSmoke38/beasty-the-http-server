import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import RegisterModal from './components/registerModal';
import { authAPI } from './services/api';
import DNA from './components/DNA';
import Logs from './components/Logs';
import Lore from './components/Lore';
import Arch from './components/Arch';
import Favicon from './components/Favicon';
import { isTokenExpired, cleanupExpiredTokens, getTokenExpirationTime } from './utils/tokenUtils';

const HTTP_OPTIONS = [
  'GET /',
  'GET /beasty',
  'GET /beasty?withIP=true'
];

// Helper function to color JSON keys
const colorizeJsonKeys = (jsonStr) => {
  return jsonStr.replace(/"([^"]+)":/g, '<span style="color: #f6c177">"$1"</span>:');
};

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [httpOption, setHttpOption] = useState('GET /');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const [response, setResponse] = useState(null);
  const [remainingRequests, setRemainingRequests] = useState(null);
  const [requestCount, setRequestCount] = useState(0);
  const [currentPage, setCurrentPage] = useState('main');
  const [displayedCommand, setDisplayedCommand] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [isResponseTyping, setIsResponseTyping] = useState(false);
  const [showResponseCursor, setShowResponseCursor] = useState(false);
  const [visitorCount, setVisitorCount] = useState(0);

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

  // Add cleanup interval with error handling
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        cleanupExpiredTokens();
      } catch (error) {
        console.error('Token cleanup error:', error);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle token operations with error handling
  const handleTokenOperation = (operation) => {
    try {
      return operation();
    } catch (error) {
      console.error('Token operation error:', error);
      return null;
    }
  };

  // Typing animation effect for command
  useEffect(() => {
    if (isTyping) {
      setShowCursor(false);
      const command = `curl -i http://localhost:8000${httpOption.split(' ')[1]}`;
      let currentIndex = 0;
      
      const typingInterval = setInterval(() => {
        if (currentIndex <= command.length) {
          setDisplayedCommand(command.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          setShowCursor(true);
        }
      }, 50);

      return () => clearInterval(typingInterval);
    }
  }, [httpOption, isTyping]);

  // Typing animation effect for response
  useEffect(() => {
    if (response) {
      setIsResponseTyping(true);
      setShowResponseCursor(false);
      setShowCursor(false);
      
      // Convert response to string and colorize keys
      const responseStr = JSON.stringify(response, null, 2);
      let currentIndex = 0;
      
      const typingInterval = setInterval(() => {
        if (currentIndex <= responseStr.length) {
          const partialResponse = responseStr.slice(0, currentIndex);
          setDisplayedResponse(colorizeJsonKeys(partialResponse));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsResponseTyping(false);
          setShowResponseCursor(true);
        }
      }, 20);

      return () => clearInterval(typingInterval);
    }
  }, [response]);

  // Handle dropdown selection
  const handleOptionSelect = (option) => {
    setHttpOption(option);
    setIsDropdownOpen(false);
    setIsTyping(true);
    setShowResponseCursor(false); // Hide response cursor when new command starts
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await authAPI.login({
        email: e.target.email.value,
        password: e.target.password.value
      });

      if (response.success) {
        const { accessToken } = response.data;
        
        // Check if token is already expired
        if (handleTokenOperation(() => isTokenExpired(accessToken))) {
          setLoginError('Login failed: Token expired');
          return;
        }

        // Store the user data and token
        setUser({
          ...response.data.user,
          token: accessToken
        });
        
        // Set up token expiration check
        const expirationTime = handleTokenOperation(() => getTokenExpirationTime(accessToken));
        if (expirationTime) {
          const timeUntilExpiry = expirationTime - Date.now();
          setTimeout(() => {
            handleTokenOperation(() => {
              setUser(null);
              setRemainingRequests(null);
              setRequestCount(0);
            });
          }, timeUntilExpiry);
        }

        setShowLogin(false);
      } else {
        setLoginError(response.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('=== Logout Process Started ===');
    console.log('Current user before logout:', user);
    setUser(null);
    setRemainingRequests(null);
    setRequestCount(0); // Reset request count on logout
    console.log('User state cleared');
    console.log('=== Logout Process Completed ===');
  };

  const handleSendRequest = async () => {
    try {
      if (!user || !user.token) {
        setResponse({ error: "Please login first" });
        return;
      }

      // Check if token is expired
      if (handleTokenOperation(() => isTokenExpired(user.token))) {
        setResponse({ error: "Session expired. Please login again." });
        return;
      }

      // Increment request count
      setRequestCount(prev => prev + 1);

      const endpoint = httpOption.split(' ')[1];
      console.log('Sending request to Beasty server:', endpoint);
      
      // Make request to Beasty server
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Beasty server response:', data);
      
      // Update remaining requests from the response
      if (data.remainingRequests !== undefined) {
        setRemainingRequests(data.remainingRequests);
        // Remove remainingRequests from the response data
        const { remainingRequests, ...responseData } = data;
        setResponse(responseData);
      } else if (data.userInfo?.remainingRequests !== undefined) {
        setRemainingRequests(data.userInfo.remainingRequests);
        // Remove remainingRequests from userInfo
        const { remainingRequests, ...userInfo } = data.userInfo;
        setResponse({ ...data, userInfo });
      } else if (data.metadata?.remainingRequests !== undefined) {
        setRemainingRequests(data.metadata.remainingRequests);
        // Remove remainingRequests from metadata
        const { remainingRequests, ...metadata } = data.metadata;
        setResponse({ ...data, metadata });
      } else {
        setResponse(data);
      }

      // If we get a 429 status, set remaining requests to 0
      if (!response.ok && response.status === 429) {
        setRemainingRequests(0);
        throw new Error(`[You have used all your beasty requests] status: ${response.status}`);
      }
    } catch (error) {
      console.error('Request error:', error);
      setResponse({ error: error.message || 'Request failed' });
    }
  };

  // Add effect to increment visitor count
  useEffect(() => {
    // Get the current count from localStorage or start at 0
    const currentCount = parseInt(localStorage.getItem('visitorCount') || '0');
    // Increment the count
    const newCount = currentCount + 1;
    // Save to localStorage
    localStorage.setItem('visitorCount', newCount.toString());
    // Update state
    setVisitorCount(newCount);
  }, []); // Run only once when component mounts

  const renderPage = () => {
    switch (currentPage) {
      case 'dna':
        return <DNA />;
      case 'logs':
        return <Logs />;
      case 'lore':
        return <Lore />;
      case 'arch':
        return <Arch />;
      default:
        return (
          <>
            <div className="beasty-center-content">
              <div className="beasty-logo pixel-font">
                beasty<span className="beasty-dot">.</span>
              </div>
              <div className="beasty-desc">A HTTP server built from scratch.</div>
              <div className="beasty-desc beasty-desc-secondary">No frameworks. No shortcuts. Just raw code.</div>
              <div className="beasty-info-blue">4 requests only. No retries.</div>
              <div className="beasty-desc" style={{ marginTop: '25px' }}>
                Lore <span className="beasty-docs-ref">(AKA Docs)</span> explain how it works.
              </div>
              <div className="beasty-desc beasty-desc-secondary" style={{ fontSize: '0.9rem', marginTop: '5px' }}>
                (recommended to read first, then try)
              </div>
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
                      onClick={() => handleOptionSelect(option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Terminal-like merged info box */}
            <div className="beasty-info-merged-box terminal-box">
              <div className="terminal-line">
                <span className="terminal-user">beasty@server</span>:<span className="terminal-path">~$</span>
                <span className="terminal-command">
                  {displayedCommand}
                </span>
                {showCursor && !isResponseTyping && <span className="terminal-cursor">&nbsp;</span>}
              </div>
              {response && (
                <div className="terminal-response">
                  <div className="response-header">Response:</div>
                  <pre dangerouslySetInnerHTML={{ __html: displayedResponse }}>
                  </pre>
                  {showResponseCursor && <span className="terminal-cursor">&nbsp;</span>}
                </div>
              )}
            </div>
            {/* Footer navigation hints */}
            <div className="beasty-footer-nav">
              <button 
                className={`beasty-send-btn ${requestCount >= 5 ? 'beasty-send-btn-disabled' : ''}`}
                onClick={requestCount >= 5 ? undefined : handleSendRequest}
                disabled={requestCount >= 5}
                style={{ pointerEvents: requestCount >= 5 ? 'none' : 'auto' }}
              >
                <span className="beasty-footer-hint beasty-footer-orange">[Enter→</span>Send<span className="beasty-footer-hint">]</span>
              </button>
              <span className="beasty-footer-hint">[Open→</span>
              <span 
                className="beasty-doc-link" 
                onClick={() => setCurrentPage('lore')}
                style={{ cursor: 'pointer' }}
              >
                Documentation
              </span>
              <span className="beasty-footer-hint">]</span>
            </div>
          </>
        );
    }
  };

  return (
    <div className="beasty-bg">
      <Favicon />
      {/* Top bar with tabs and path */}
      <div className="beasty-topbar">
        <span className="beasty-tabs">
          <span 
            className={`beasty-tab ${currentPage === 'main' ? 'beasty-tab-active' : ''}`}
            onClick={() => setCurrentPage('main')}
          >
            Main
          </span>
          <span 
            className={`beasty-tab ${currentPage === 'dna' ? 'beasty-tab-active' : ''}`}
            onClick={() => setCurrentPage('dna')}
          >
            DNA
          </span>
          <span 
            className={`beasty-tab ${currentPage === 'logs' ? 'beasty-tab-active' : ''}`}
            onClick={() => setCurrentPage('logs')}
          >
            Logs
          </span>
          <span 
            className={`beasty-tab ${currentPage === 'lore' ? 'beasty-tab-active' : ''}`}
            onClick={() => setCurrentPage('lore')}
          >
            Lore
          </span>
          <span 
            className={`beasty-tab ${currentPage === 'arch' ? 'beasty-tab-active' : ''}`}
            onClick={() => setCurrentPage('arch')}
          >
            Arch
          </span>
        </span>
        <span className="beasty-auth-btns">
          {!user ? (
            <>
              <button className="beasty-btn" onClick={() => setShowRegister(true)}>Register</button>
              <button className="beasty-btn" onClick={() => setShowLogin(true)}>Login</button>
            </>
          ) : (
            <button className="beasty-btn" onClick={handleLogout}>Logout</button>
          )}
        </span>
      </div>
      {/* Main content */}
      <div className="beasty-mainbox">
        {renderPage()}
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
      <div className="beasty-footer">
        <div className="beasty-footer-love">[with <span className="beasty-heart">♥</span> by <span className="beasty-author">chxshi</span>]</div>
        <div className="beasty-visitor-count">visitors: {visitorCount}</div>
      </div>
    </div>
  );
}

export default App;
