import React from 'react';

function Logs() {
  return (
    <div className="beasty-page">
      <div className="beasty-center-content">
        <div className="beasty-logo pixel-font">
          Logs<span className="beasty-dot">.</span>
        </div>
        <div className="beasty-desc">Server activity and events.</div>
        <div className="beasty-desc beasty-desc-secondary">Real-time monitoring and debugging.</div>
      </div>

      <div className="beasty-info-merged-box terminal-box">
        <div className="terminal-line">
          <span className="terminal-user">beasty@logs</span>:<span className="terminal-path">~$</span>
          <span className="terminal-command">tail -f server.log</span>
          <span className="terminal-cursor">&nbsp;</span>
        </div>
        <div className="terminal-response">
          <pre>
{`[INFO] Server started on port 8000
[INFO] CORS enabled for: http://localhost:5174
[INFO] Rate limiting: 4 requests per 3 minutes
[INFO] Compression enabled (level: 6)
[INFO] IP access control enabled
[INFO] Request throttling enabled (1000ms)
[DEBUG] New connection from 127.0.0.1
[DEBUG] Authentication successful for user: test@example.com
[DEBUG] Rate limit: 3 requests remaining
[DEBUG] CORS preflight request handled
[DEBUG] Request completed in 45ms
[DEBUG] New connection from 127.0.0.1
[DEBUG] Rate limit exceeded for IP: 127.0.0.1
[WARN] Blocked request from 127.0.0.1 (rate limit)`}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default Logs; 