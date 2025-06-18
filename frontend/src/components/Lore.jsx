import React from 'react';

function Lore() {
  return (
    <div className="beasty-page">
      <div className="beasty-center-content">
        <div className="beasty-logo pixel-font">
          Lore<span className="beasty-dot">.</span>
        </div>
        <div className="beasty-desc">Documentation and guides.</div>
        <div className="beasty-desc beasty-desc-secondary">Learn how Beasty works.</div>
      </div>

      <div className="beasty-info-merged-box terminal-box">
        <div className="terminal-line">
          <span className="terminal-user">beasty@lore</span>:<span className="terminal-path">~$</span>
          <span className="terminal-command">cat README.md</span>
          <span className="terminal-cursor">&nbsp;</span>
        </div>
        <div className="terminal-response">
          <pre>
{`beasty began with a bold idea:

Build an HTTP server from scratch, then craft a frontend to sit atop it — and deploy the whole beast.

It started smooth — within a day, a basic server was born using CodeCrafters. A simple GET request echoed back in the terminal, and it felt like conquering a mountain. The thrill was real.

But then came the chaos.

Managing real-time data, user sessions, request limits, IP tracking, rate-limiting — each layer came with so many bugs. 

Now, Beasty lives.
A live, rate-limited, metadata-reflecting request tool.
Built from scratch. With intention.


# beasty
========

beasty is a minimalist, ephemeral request tool.
It allows users to login, interact with 3 live endpoints, and retrieve real metadata about their requests — all with a strict 4-request limit per week per user`}


          </pre>
          <div id="user-guide" style={{ marginTop: '2rem' }}>
            <pre>
{`# User Guide
===========

1. Register and login to Beasty
2. Wait for the "Ready! Beasty is awake" message, cause the server cold starts!
3. Once ready, you can make requests to:
   • /greet - Simple hello
   • /beasty - Your request metadata
   • /beasty?withIP - Metadata with your IP

Note: Don't make requests until you see "Ready! Beasty is awake"!


# Available endpoints
===================

| Endpoint         | Returns                  |                           
|------------------|--------------------------|
| /greet           | Just says hi             | 
| /beasty          | User metadata without IP | 
| /beasty?with=IP  | User metadata + IP       | 



> Nothing is mocked. Everything is real-time.
---------------------------------------------

> Privacy-First Logging: We don't store any IP addresses or user agents in our logs - only request methods, paths, and status codes. Your privacy is our priority.
-------------------------------------------------------------------------------


### Request Flow (Step-by-Step)
============================

[1] Client (Frontend)
    └─ sends request to Beasty
       (with Authorization token)

[2] Beasty Server
    └─ performs security checks:
       - Rate limiting (4 req/3min)
       - Request throttling (1s between)
       - IP access control
       - Token validation

[3] Beasty Server
    └─ makes request to Backend
       (with sanitized token)

[4] Backend (BE)
    └─ processes request:
       - Verifies JWT token
       - Checks user permissions
       - Updates request count
       - Returns user data

[5] Beasty Server
    └─ processes backend response:
       - Adds real-time metadata
       - Applies gzip compression
       - Adds security headers
       - Logs the request

[6] Beasty Server
    └─ sends final response to Client
       (with metadata, userInfo, and remaining requests)



## Features
==========

- Custom HTTP server implementation
- JWT-based authentication
- Rate limiting (4 requests per 3 minutes)
- CORS support with configurable origins
- Request throttling (1 second between requests)
- Gzip compression
- IP access control
- Input sanitization and validation


more coming soon!!!!!`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Lore; 