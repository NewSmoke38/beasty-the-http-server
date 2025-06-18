import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import RegisterModal from './components/registerModal';
import { authAPI, beastyApi } from './services/api';
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
  const [visitorCount, setVisitorCount] = useState(0);   // for fun

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        cleanupExpiredTokens();
      } catch (error) {
        console.error('Token cleanup error:', error);
      }
        }, 10800000);
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

  // Typing animation effect for command   // my idea 
  useEffect(() => {
    if (isTyping) {
      setShowCursor(false);
      const command = `curl -i https://beasty-server.onrender.com${httpOption.split(' ')[1]}`;
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

  // Typing animation effect for response same
  useEffect(() => {
    if (response) {
      setIsResponseTyping(true);
      setShowResponseCursor(false);
      setShowCursor(false);
      
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
    // Clear any ready message timeouts
    if (window.__beastyReadyMsgTimeouts) {
      window.__beastyReadyMsgTimeouts.forEach(clearTimeout);
      window.__beastyReadyMsgTimeouts = null;
    }
    setIsTyping(true);
    setShowResponseCursor(false); // Hide response cursor when new command starts.   // very imp
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
        
        if (handleTokenOperation(() => isTokenExpired(accessToken))) {
          setLoginError('Login failed: Token expired');
          return;
        }

        setUser({
          ...response.data.user,
          token: accessToken
        });
        
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
        // Show a sequence of server ready messages in the req url area (displayedCommand) with typing animation
        const serverWakeMessages = [
          'Waking up Beasty server...',
          'Brewing some code magic...',
          'Stretching digital muscles...',
          'Checking the pipes...',
          'Feeding the hamsters...',
          'Spinning up the gears...',
          'Almost there, dusting off bits...',
          'Final system checks...'
        ];
        let pingReturned = false;
        let readyShown = false;
        const showReady = () => {
          if (!readyShown) {
            animateDisplayedCommand('Ready! Beasty is awake. Choose a request to begin!');
            readyShown = true;
          }
        };
        // Helper to animate a message in the req url area
        const animateDisplayedCommand = (msg) => {
          setShowCursor(false);
          let currentIndex = 0;
          setIsTyping(false);
          const typingInterval = setInterval(() => {
            if (currentIndex <= msg.length) {
              setDisplayedCommand(msg.slice(0, currentIndex));
              currentIndex++;
            } else {
              clearInterval(typingInterval);
              setShowCursor(true);
            }
          }, 40);
        };
        // Sequentially animate each message for 2.5s (20s total for 8 messages)
        const animateMessages = async () => {
          for (let idx = 0; idx < serverWakeMessages.length; idx++) {
            await new Promise((resolve) => {
              animateDisplayedCommand(serverWakeMessages[idx]);
              setTimeout(resolve, 2500);
            });
          }
          // After all messages, always show ready
          showReady();
        };
        animateMessages();
        // Start pinging Beasty in parallel
        beastyApi.ping(accessToken).then(() => {
          pingReturned = true;
          // If all messages have been shown, show ready (redundant, but safe)
          if (readyShown === false && displayedCommand === serverWakeMessages[serverWakeMessages.length - 1]) {
            showReady();
          }
        }).catch(() => {
          if (readyShown === false && displayedCommand === serverWakeMessages[serverWakeMessages.length - 1]) {
            showReady();
          }
        });
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

      if (handleTokenOperation(() => isTokenExpired(user.token))) {
        setResponse({ error: "Session expired. Please login again." });
        return;
      }

      // Increment request count
      setRequestCount(prev => prev + 1);

      const endpoint = httpOption.split(' ')[1];
      console.log('Sending request to Beasty server:', endpoint);
      


      // real game starte here in the merge box
      // Make request to Beasty server using the correct URL
      const response = await fetch(`https://beasty-server.onrender.com${endpoint}`, {
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

      if (!response.ok && response.status === 429) {
        setRemainingRequests(0);
        throw new Error(`[You have used all your beasty requests] status: ${response.status}`);
      }

      if (!response.ok && response.status === 403) {
        setRemainingRequests(0);
        throw new Error(`[Rate limit exceeded] status: ${response.status}`);
      }

      if (!response.ok && response.status === 401) {
        setResponse({ error: "Unauthorized. Please login again." });
        return;
      }

      if (!response.ok) {
        throw new Error(`[Error] status: ${response.status}`);
      }

    } catch (err) {
      console.error('Request error:', err);
      setResponse({ error: err.message || 'An error occurred while making the request' });
    }
  };

 useEffect(() => {
    // Rehydrate user from localStorage on app load
    const token = localStorage.getItem('token');
    if (token && !isTokenExpired(token)) {
      setUser({ token });
    } else {
      setUser(null);
    }
    const currentCount = parseInt(localStorage.getItem('visitorCount') || '0');
    const newCount = currentCount + 1;
    localStorage.setItem('visitorCount', newCount.toString());
    setVisitorCount(newCount);
  }, []); 

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
                Lore <a href="#user-guide" onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage('lore');
                  setTimeout(() => {
                    const element = document.getElementById('user-guide');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }} style={{ color: '#7ed6df', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}>(User Guide)</a> explains how it works.
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
                className={`beasty-send-btn ${!user || requestCount >= 5 ? 'beasty-send-btn-disabled' : ''}`}
                onClick={!user || requestCount >= 5 ? undefined : handleSendRequest}
                disabled={!user || requestCount >= 5}
                style={{ pointerEvents: !user || requestCount >= 5 ? 'none' : 'auto' }}
              >
                <span className="beasty-footer-hint beasty-footer-orange">[Enter→</span>Send<span className="beasty-footer-hint">]</span>
              </button>
              <span className="beasty-footer-hint">[Open→</span>
              <span className="beasty-doc-link">
                <a href="https://cypress-cayenne-00d.notion.site/Making-of-beasty-2145118366ab809d91c1d42dd96cc57a" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Documentation</a>
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
              <button className="beasty-btn beasty-register-btn" onClick={() => setShowRegister(true)}>Register</button>
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
