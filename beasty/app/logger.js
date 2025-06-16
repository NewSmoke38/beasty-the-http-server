import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory with restricted permissions (700 = rwx------)
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { mode: 0o700 });
}

// function to clean up old logs
function cleanupOldLogs() {
    try {
        // get all log files
        const files = fs.readdirSync(logsDir);
        const now = Date.now();
        
        files.forEach(file => {
            if (file.endsWith('.log')) {
                const filePath = path.join(logsDir, file);
                const stats = fs.statSync(filePath);
                
                // remove logs older than 7 days (7 * 24 * 60 * 60 * 1000 milliseconds)
                if (now - stats.mtime.getTime() > 7 * 24 * 60 * 60 * 1000) {
                    fs.unlinkSync(filePath);
                    console.log(`Cleaned up old log file: ${file}`);
                }
            }
        });
    } catch (error) {
        console.error('Error cleaning up logs:', error);
    }
}

// run cleanup every 24 hours (good practice)
setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000);

cleanupOldLogs();

export function logRequest(ip, method, requestPath, statusCode, userAgent, timestamp) {
    const logEntry = {
        timestamp: timestamp || new Date().toISOString(),
        method,
        path: requestPath,
        statusCode,
        // IP address removed for privacy (chad)
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