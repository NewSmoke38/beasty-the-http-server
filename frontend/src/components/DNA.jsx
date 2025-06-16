import React from 'react';

function DNA() {
  return (
    <div className="beasty-page">
      <div className="beasty-center-content">
        <div className="beasty-logo pixel-font">
          DNA<span className="beasty-dot">.</span>
        </div>
        <div className="beasty-desc">The genetic code of Beasty.</div>
        <div className="beasty-desc beasty-desc-secondary">Core components and architecture.</div>
      </div>

      <div className="beasty-info-merged-box terminal-box">
        <div className="terminal-line">
          <span className="terminal-user">beasty@dna</span>:<span className="terminal-path">~$</span>
          <span className="terminal-command">cat beasty.dna</span>
          <span className="terminal-cursor">&nbsp;</span>
        </div>
        <div className="terminal-response">
          <pre>
{`{
  "core": {
    "server": "Custom HTTP server built from scratch",
    "language": "Node.js with ES modules",
    "architecture": "Event-driven, non-blocking I/O"
  },
  "features": {
    "authentication": "JWT-based with secure token handling",
    "rate_limiting": "IP-based with configurable windows",
    "cors": "Configurable origin policies",
    "security": "Input sanitization and validation",
    "compression": "Gzip support with configurable levels"
  },
  "dependencies": {
    "core": "Node.js built-in modules only",
    "external": "Minimal, focused on security"
  }
}

 ██████╗ ███████╗ █████╗ ███████╗████████╗██╗   ██╗
 ██╔══██╗██╔════╝██╔══██╗██╔════╝╚══██╔══╝╚██╗ ██╔╝
 ██████╔╝█████╗  ███████║███████╗   ██║    ╚████╔╝ 
 ██╔══██╗██╔══╝  ██╔══██║╚════██║   ██║     ╚██╔╝  
 ██████╔╝███████╗██║  ██║███████║   ██║      ██║   
 ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝      ╚═╝   ●`}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default DNA; 