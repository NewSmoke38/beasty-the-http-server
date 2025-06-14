const fs = require('fs');
const path = require('path');

// Create logs directory with restricted permissions (700 = rwx------)
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { mode: 0o700 });
}

function logRequest(ip, method, requestPath, statusCode, userAgent, timestamp) {
    const logEntry = {
        timestamp: timestamp || new Date().toISOString(),
        ip,
        method,
        path: requestPath,
        statusCode,
        userAgent
    };

    // Log file name based on date (e.g., 2024-03-14.log)
    const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);

    // Set restricted permissions on log file (600 = rw-------)
    if (!fs.existsSync(logFile)) {
        fs.writeFileSync(logFile, '', { mode: 0o600 });
    }

    // Append log entry to file
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}

module.exports = { logRequest }; 