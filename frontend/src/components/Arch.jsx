import React from 'react';

function Arch() {
  return (
    <div className="beasty-page">
      <div className="beasty-center-content">
        <div className="beasty-logo pixel-font">
          Arch<span className="beasty-dot">.</span>
        </div>
        <div className="beasty-desc">Security and Architecture.</div>
<div className="beasty-desc beasty-desc-secondary">Understanding Beasty's security flows.</div>
      </div>

      <div className="beasty-info-merged-box terminal-box">
        <div className="terminal-line">
          <span className="terminal-user">beasty@arch</span>:<span className="terminal-path">~$</span>
          <span className="terminal-command">cat security.md</span>
    <span className="terminal-cursor">&nbsp;</span>
        </div>
        <div className="terminal-response">
          <pre>
{`# Security Architecture
====================

Beasty implements multiple layers of security to protect against common web vulnerabilities and ensure fair usage.

# Security Layers
===============

[1] Rate Limiting
    └─ Prevents abuse by limiting requests:
       - 4 requests per 3 minutes per IP
       - Tracks requests in memory
       - Returns 429 when limit exceeded
       - Resets counter after window

[2] IP Access Control
    └─ Manages IP-based access:
       - Whitelist for trusted IPs
       - Blacklist for blocked IPs
       - Bypasses rate limiting for whitelist
       - Blocks all access for blacklist

[3] Request Throttling
    └─ Prevents rapid-fire requests:
       - Minimum 1 second between requests
       - Per-IP tracking
       - Returns 429 if too fast
       - Helps prevent DoS attacks

[4] CORS Protection
    └─ Controls cross-origin access:
       - Configurable allowed origins
       - Strict origin validation
       - Secure headers
       - Prevents unauthorized access

[5] Performance Security
    └─ Optimizes and protects:
       - Gzip compression (level 6)
       - 5-second response timeout
       - Error handling
       - Resource optimization

# Security Flow
==============

[1] Incoming Request
    └─ Client sends HTTP request
       - Validates origin
       - Checks headers
       - Extracts IP

[2] Security Checks
    └─ Multiple validations:
       - Rate limit check
       - IP access check
       - Throttling check
       - CORS validation

[3] Request Processing
    └─ If all checks pass:
       - Compresses response
       - Adds security headers
       - Logs request
       - Returns data

[4] Error Handling
    └─ If any check fails:
       - Returns appropriate status
       - Logs security event
       - Blocks request
       - Protects resources

# Configuration
=============

All security settings are configurable in config.js:
- Rate limit window and count
- Throttling delay
- CORS origins
- IP lists
- Timeouts
- Compression


> Every request is validated, every response is secured.
----------------------------------------------------`}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default Arch; 