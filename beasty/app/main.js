import net from 'net';
import zlib from 'zlib';   /// for compression
import { config } from '../config.js';
import jwt from 'jsonwebtoken';
import { logRequest } from './logger.js';
import os from 'os';
import fetch from 'node-fetch';

// Get system username
const systemUsername = os.userInfo().username;
console.log("System username:", systemUsername);  // Debug log

// Input sanitization functions
function sanitizePath(path) {
    // remove any double slashes (real good)
    path = path.replace(/\/+/g, '/');
    
    // remove any potentially dangerous characters (real good)
    path = path.replace(/[^a-zA-Z0-9\/\?=&-]/g, '');
    
    // ensure path starts with a single slash
    path = path.startsWith('/') ? path : '/' + path;
    
    return path;
}

// Helper function to normalize IP addresses
function normalizeIP(ip) {
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
        return '127.0.0.1';
    }
    // Handle IPv6-mapped IPv4 addresses
    if (ip.startsWith('::ffff:')) {
        return ip.substring(7);
    }
    return ip;
}

function sanitizeToken(token) {
    // remove any non-alphanumeric characters except dots and dashes (this really is good)
    return token.replace(/[^a-zA-Z0-9\.-]/g, '');
}

function sanitizeQueryParams(queryString) {
    // only allow specific query parameters - we have only one for IP
    const allowedParams = ['withIP'];
    const params = new URLSearchParams(queryString);
    
    // filter out any parameters not in allowedParams
    for (const key of params.keys()) {
        if (!allowedParams.includes(key)) {
            params.delete(key);
        }
    }
    
        return params.toString();
}

// Function to extract origin from request headers
function extractOrigin(headers) {
    // Find the origin header (case-insensitive)
    const originHeader = headers.find(h => h.toLowerCase().startsWith('origin:'));
         if (!originHeader) {
        console.log('No origin header found');
        return null;
    }

    // Split only on the first colon to preserve the rest of the URL
    const [key, ...rest] = originHeader.split(':');
    const originValue = rest.join(':').trim();
    
    
    return originValue;
}

// CORS headers function
function corsHeaders(origin) {
    // If no origin provided, return default headers
    if (!origin) {
        console.log('No origin provided, using default CORS headers');
        return [
            "Access-Control-Allow-Origin: https://beasty-frontend.vercel.app",
            "Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers: Content-Type, Authorization, Accept, X-Requested-With, Origin, X-CSRF-Token",
            "Access-Control-Allow-Credentials: true",
            "Access-Control-Max-Age: 86400"
        ];
    }

    
    // Always return the actual origin in the header
    const headers = [
        `Access-Control-Allow-Origin: ${origin}`,
        "Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers: Content-Type, Authorization, Accept, X-Requested-With, Origin, X-CSRF-Token",
        "Access-Control-Allow-Credentials: true",
        "Access-Control-Max-Age: 86400"
    ];

    return headers;
}

//  protection against common web vulnerabilities
const securityHeaders = [
    "X-Content-Type-Options: nosniff",     // stops browser from mimie-sniffing(guessing the type of data server is sending) it can be bad ...

    // Prevents your site from being embedded in iframes    // actually means that a website cant put our website in thiers to show off like its thier toy hehe
    // Protects against clickjacking attacks        // this one is so lit tbh
    "X-Frame-Options: DENY",

    // Enables browser's XSS filtering
    // Blocks the page if XSS attack is detected
    "X-XSS-Protection: 1; mode=block",       // here 1 means turn on protection and block means if smthg sus is detected forging our website then we'll block the whole page haha

    // Forces browsers to use HTTPS, max age=1year
    "Strict-Transport-Security: max-age=31536000; includeSubDomains"
];

// Rate limiting
// Create a Map(it is better here in this case) to store request counts for each IP address
const requestCounts = new Map();
const ipBlockList = new Map();  // Add this line for IP blocking
const lastRequestTime = new Map();  // add this for request throttling (that a user can make x reqs with a time btw every req which we.ve set to 1 sec, diff from rate limiting tho)

// Set up a cleanup interval that runs every 3 hours (3 * 60 * 60 * 1000 milliseconds)
const cleanupInterval = setInterval(() => {
    // Get current timestamp in milliseconds
    const now = Date.now();

    // Clean up request counts
    for (const [ip, data] of requestCounts.entries()) {
        // Check if this IP's last request was more than windowMs ago
         // windowMs is 15 minutes (15 * 60 * 1000 milliseconds) 
            if (now - data.timestamp > config.rateLimit.windowMs) {
            // If yes, remove this IP from the Map
            // This prevents the Map from growing infinitely
            requestCounts.delete(ip);
        }
    }

    // Clean up IP block list
    for (const [ip, blockData] of ipBlockList.entries()) {
        if (blockData.blockedUntil < now) {
            ipBlockList.delete(ip);
        }
    }

    // Clean up request throttling
    for (const [ip, lastTime] of lastRequestTime.entries()) {
        if (now - lastTime > config.throttling.minTimeBetweenRequests * 2) {
            lastRequestTime.delete(ip);
        }
    }

    console.log('Cleanup completed:', {
        requestCounts: requestCounts.size,
        ipBlockList: ipBlockList.size,
        lastRequestTime: lastRequestTime.size
    });
}, 3 * 60 * 60 * 1000); // Run this cleanup every 3 hours

// Cleanup on server shutdown
// SIGTERM is a signal sent to a process to request its termination
process.on('SIGTERM', () => {
    // Stop the cleanup interval we created earlier
    // This prevents memory leaks by stopping the timer
    clearInterval(cleanupInterval);

    // Gracefully close the server
    // This stops accepting new connections but allows existing ones to complete
    server.close();
});

global.beastyStartTime = Date.now();        // shows server up time of beasty


// beasty making startsss
// Create a new TCP server using Node's net module
// 'l' is the socket connection for each client
const server = net.createServer((l) => {
    l.on("data", (b) => {
        const ip = normalizeIP(l.remoteAddress);
        const requestData = b.toString();
        const headers = requestData.split('\r\n');
        const origin = extractOrigin(headers);
        
        console.log('Received request:', {
            ip,
            headers: headers.slice(0, 5), // Log first 5 headers
            origin
        });

        // Extract and verify JWT token
        const authHeader = headers.find(h => h.toLowerCase().startsWith('authorization:'));
        let isAdmin = false;
        
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, config.jwtSecret);
                isAdmin = decoded.role === 'admin';
                console.log('User role:', decoded.role);
            } catch (error) {
                console.log('JWT verification failed:', error.message);
            }
        }

        // Handle preflight requests
        if (requestData.startsWith('OPTIONS')) {
            console.log('Handling preflight request from origin:', origin);
            
            // Always respond to preflight with 204 and CORS headers
            const corsHeadersList = corsHeaders(origin);
            console.log('Sending preflight response headers:', corsHeadersList);
            
            const response = [
                "HTTP/1.1 204 No Content",
                "Content-Type: text/plain",
                ...corsHeadersList,
                "",
                ""
            ].join("\r\n");
            
            console.log('Full preflight response:', response);
            
            l.write(response, () => {
                console.log('Preflight response sent');
                l.destroy();
            });
            return;
        }

        // small thingy done for whitlisting and blacklisting IPs for the sake of beasty!! 
        // Check if IP access control is enabled
        if (config.ipAccess.enabled && !isAdmin) {  // Skip IP checks for admin
            // Check blacklist first
            if (config.ipAccess.blacklist.includes(ip)) {
                const body = JSON.stringify({ 
                    error: "Access denied",
                    details: "Your IP has been blocked"
                });
                
                const response = [
                    "HTTP/1.1 403 Forbidden",
                    "Content-Type: application/json",
                    ...corsHeaders(origin),
                    ...securityHeaders,
                    `Content-Length: ${Buffer.byteLength(body)}`,
                    "",
                    body
                ].join("\r\n");
                
                l.write(response, () => {
                    l.destroy();
                });
                return;
            }
            
            // If IP is whitelisted, bypass rate limiting - hehe moment
            if (config.ipAccess.whitelist.includes(ip)) {
                // skip rate limiting checks - vip has come 
                // Continue with request processing
            } else {
                // Check rate limiting for non-whitelisted IPs
                if (ipBlockList.has(ip)) {
                    const blockData = ipBlockList.get(ip);
                    if (blockData.blockedUntil > Date.now()) {
                        // Send a clear error message for blocked IP
                        const body = JSON.stringify({
                            error: "Access denied",
                            details: "You have been blocked for a week. Please try again after 7 days."
                        });
                        const response = [
                            "HTTP/1.1 403 Forbidden",
                            "Content-Type: application/json",
                            ...corsHeaders(origin),
                            ...securityHeaders,
                            `Content-Length: ${Buffer.byteLength(body)}`,
                            "",
                            body
                        ].join("\r\n");
                        l.write(response, () => {
                            l.destroy();
                        });
                        return;
                    } else {
                        ipBlockList.delete(ip);
                    }
                }
            }
        }

        // Check request throttling - this is different from rate limiting!
        // Rate limiting - You can make X requests per Y minutes
        // Throttling - You must wait Z seconds between requests
        if (config.throttling.enabled && !isAdmin) {  // Skip throttling for admin
            // get the timestamp of the last request from this IP
            // if no previous request, default to 0 (epoch time) 
            const lastTime = lastRequestTime.get(ip) || 0;
            
            // Calculate how many milliseconds have passed since last request  // real work is done here and then calculated that if user can go further 
            const timeSinceLastRequest = Date.now() - lastTime;
            
            // If not enough time has passed since last request
            if (timeSinceLastRequest < config.throttling.minTimeBetweenRequests) {
                const body = JSON.stringify({ 
                    error: "Too many requests",
                    details: `Please wait ${(config.throttling.minTimeBetweenRequests - timeSinceLastRequest) / 1000} seconds between requests`
                });
                
                const response = [
                    "HTTP/1.1 429 Too Many Requests",
                    "Content-Type: application/json",
                    ...corsHeaders(origin),
                    ...securityHeaders,
                    `Content-Length: ${Buffer.byteLength(body)}`,
                    "",
                    body
                ].join("\r\n");
                
                l.write(response, () => {
                    l.destroy();
                });
                return;
            }
            
        lastRequestTime.set(ip, Date.now());
        }


        const f = headers.slice(1);      // convert b data coming from users in packets to string
        // f is an array tho

        // extract the User-Agent header from the req headers - tells us what browser/client is making the request, although for now it always will be curl cause we only allow it
        const userAgent = extractUserAgent(f);

        // parse the first line of the HTTP request which contains-
        // j = HTTP method (GET, POST, etc.)
        // rawPath = the requested path (/beasty, /echo, etc.)
        // q = HTTP version (HTTP/1.1)
        const requestLine = headers[0];  // Get the first line which contains the method
        const [j, rawPath, q] = requestLine.split(" ");

        // sanitize the path and query parameters
        const [path, queryString] = rawPath.split('?');
        const sanitizedPath = sanitizePath(path);
        const sanitizedQuery = queryString ? sanitizeQueryParams(queryString) : '';
        const i = sanitizedQuery ? `${sanitizedPath}?${sanitizedQuery}` : sanitizedPath;

        // just some dev stuff
        // adding logging for each response
        const originalWrite = l.write;
        l.write = function(data) {
            // extract status code from response
            const statusLine = data.toString().split('\r\n')[0];
        const statusCode = statusLine.split(' ')[1];
            
            // Log the request
            logRequest(ip, j, i, statusCode, userAgent);
            
            // call original write function
            return originalWrite.apply(this, arguments);
        };

        // Rate limiting implementation
        // Get current timestamp
        const now = Date.now();
        
        // Skip rate limiting for admin
        if (!isAdmin) {
            // get existing request count for this IP or create new if none exists
            const userRequests = requestCounts.get(ip) || { count: 0, timestamp: now };
            
            // check if it's been more than the rate limit window (15 minutes)
            if (now - userRequests.timestamp > config.rateLimit.windowMs) {
                // if yes, reset the count to 1 and update timestamp
                userRequests.count = 1;
                userRequests.timestamp = now;
        } else {
                // if no, increment the count, this happens always ig, like whose gonna wait to make req dude
                userRequests.count++;
            }
            
            // save the updated request count back to our Map
            requestCounts.set(ip, userRequests);
            
            // When rate limit is exceeded (5th request)
            if (userRequests.count > config.rateLimit.max) {
                // Block the IP for 7 days
                ipBlockList.set(ip, {
                    blockedUntil: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
                    violations: (ipBlockList.get(ip)?.violations || 0) + 1
                });

                // Send the "all requests used" message for the 5th attempt
                const body = JSON.stringify({ 
                    error: "Rate limit exceeded",
                    details: "You have used all 4 of your allowed Beasty requests."
                });
                
                const response = [
                    "HTTP/1.1 403 Forbidden",
                    "Content-Type: application/json",
                    ...corsHeaders(origin),
                    ...securityHeaders,
                    `Content-Length: ${Buffer.byteLength(body)}`,
                    "",
                    body
                ].join("\r\n");
                
                l.write(response, () => {
                    l.destroy();
                });
                return;
            }
        } 

    // allowed stuff 
    // GET: for getting data
    // OPTIONS: special req for checking what methods are allowed (used by browsers for CORS)
    const allowedMethods = ["GET", "OPTIONS"];

    if (j === "OPTIONS") {
        const origin = f.find(line => line.toLowerCase().startsWith("origin:"))?.split(":")[1]?.trim();
        console.log('Preflight request from origin:', origin); // Debug log
        
        const response = [
            "HTTP/1.1 204 No Content",
            ...corsHeaders(origin),
            ...securityHeaders,
            "",
            ""
        ].join("\r\n");
        
        l.write(response);
        l.end();
        return;
    }

    // Check if the requested method is allowed
    if (!allowedMethods.includes(j)) {
        const body = JSON.stringify({ 
            error: `${j} requests are not allowed.` 
        });
        
        const response = [
            "HTTP/1.1 405 Method Not Allowed",
            "Content-Type: application/json",
            ...corsHeaders(origin),
            ...securityHeaders,
            `Content-Length: ${Buffer.byteLength(body)}`,
            "",
            body
        ].join("\r\n");
        l.write(response);
        l.end();
        return;
    }

            // 1st req (optional but recommended first)
            // Handle root path "/"
            if (i === "/") {  
                const authLine = f.find(line => line.toLowerCase().startsWith("authorization:"));
                let token = null;  // Declare token in outer scope
                
                if (authLine) {
                    const parts = authLine.split("Bearer ");
                    const rawToken = parts.length > 1 ? parts[1] : null;
                    token = rawToken ? sanitizeToken(rawToken) : null;
        } else {
                    console.log('No auth line found');  // Debug log
                }
                
                if (!token) {
                    const body = JSON.stringify({ 
                        error: "Authorization token missing" 
                    });
                    
            const response = [
                        "HTTP/1.1 401 Unauthorized",
                        "Content-Type: application/json",
                        ...corsHeaders(origin),
                        ...securityHeaders,
                        `Content-Length: ${Buffer.byteLength(body)}`,
                        "",
                        body
                    ].join("\r\n");
                    l.write(response);
                    l.end();
                    return;
                }

                // timeout, really interesting 
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), config.timeout);

                // Make request to backend to verify the token (yes this happens everytime for the sake of auth duh, well its imp so...)
                fetch(`${config.backendUrl}/api/v1/beasty/check`, {
                    method: "GET",  
                    headers: { 
                        Authorization: `Bearer ${token}`,  
                        'Accept': 'application/json'      
                    },
                    signal: controller.signal  
                })
                .then(async (beResponse) => {
                    // Clear timeout since we got a response
                    clearTimeout(timeout);
                    
                    const beData = await beResponse.json();
                    console.log('Backend response:', beData);  // Debug log
                    
                    if (!beResponse.ok) {
                        throw new Error(beData.message || 'Authentication failed');
                    }

                    // if token is good
                    const body = JSON.stringify({ 
                        message: `Hello ${beData.data?.username || 'user'}!`,
                        userId: beData.data?.userId || null,
                        remainingRequests: beData.data?.remainingRequests || null
                    });
                    
                    const response = [
                        "HTTP/1.1 200 OK",
                        "Content-Type: application/json",
                        ...corsHeaders(origin),
                        ...securityHeaders,
                        `Content-Length: ${Buffer.byteLength(body)}`,
                        "",
                        body
                    ].join("\r\n");
                    l.write(response);
                    l.end();
                })
                .catch((err) => {
                    clearTimeout(timeout);
                    console.error('Backend request error:', err);  // Debug log
                    const body = JSON.stringify({ 
                        error: "Authentication failed", 
                        details: err.message 
                    });
                    
                    const response = [
                        "HTTP/1.1 401 Unauthorized",
                        "Content-Type: application/json",
                        ...corsHeaders(origin),
                        ...securityHeaders,
                        `Content-Length: ${Buffer.byteLength(body)}`,
                        "",
                        body
                    ].join("\r\n");
                    
                    // Write response and properly close the socket
                    l.write(response, () => {
                        l.destroy();
                    });
                });
                return;
            }

        // Handle /api/v1/beasty/ping endpoint (for cold start, no request count)
        if (i === "/api/v1/beasty/ping") {
          // extracts authorization header from the incoming request lines
          const authLine = f.find(line => line.toLowerCase().startsWith("authorization:"));
          const rawToken = authLine ? authLine.split("Bearer ")[1] : null;
          const token = rawToken ? sanitizeToken(rawToken) : null;

          if (!token) {
            const body = JSON.stringify({ 
              error: "Authorization token missing" 
            });
            const response = [
              "HTTP/1.1 401 Unauthorized",
              "Content-Type: application/json",
              ...corsHeaders(origin),
              ...securityHeaders,
              `Content-Length: ${Buffer.byteLength(body)}`,
              "",
              body
            ].join("\r\n");
            l.write(response);
            l.end();
            return;
          }

          // Just verify the token, don't increment any counters
          try {
            jwt.verify(token, config.jwtSecret);
            const body = JSON.stringify({ message: "pong" });
            const response = [
              "HTTP/1.1 200 OK",
              "Content-Type: application/json",
              ...corsHeaders(origin),
              ...securityHeaders,
              `Content-Length: ${Buffer.byteLength(body)}`,
              "",
              body
            ].join("\r\n");
            l.write(response);
            l.end();
          } catch (err) {
            const body = JSON.stringify({ error: "Invalid token" });
            const response = [
              "HTTP/1.1 401 Unauthorized",
              "Content-Type: application/json",
              ...corsHeaders(origin),
              ...securityHeaders,
              `Content-Length: ${Buffer.byteLength(body)}`,
              "",
              body
            ].join("\r\n");
            l.write(response);
            l.end();
          }
          return;
        }

    // actual endpoint hitting starts here, w a user asking for magic basically lol
             // Handle /beasty route
        if (i.startsWith("/beasty")) {
          // extracts authorization header from the incoming request lines
          const authLine = f.find(line => line.toLowerCase().startsWith("authorization:"));
          const rawToken = authLine ? authLine.split("Bearer ")[1] : null;  // Split by "Bearer " to get the token
          const token = rawToken ? sanitizeToken(rawToken) : null;
                 
    if (!token) {
        const body = JSON.stringify({ 
            error: "Authorization token missing" 
        });
        
        const response = [
            "HTTP/1.1 401 Unauthorized",
            "Content-Type: application/json",
            ...corsHeaders(origin),
            ...securityHeaders,
            `Content-Length: ${Buffer.byteLength(body)}`,
            "",
            body
        ].join("\r\n");
        l.write(response);
        l.end();
        return;
    }

    // Set up timeout for the backend request
    // AbortController cancels the request if it takes too long
    const controller = new AbortController();

    const timeout = setTimeout(() => controller.abort(), config.timeout);

    // spicy stuff here, which i am proud of, cause this whole checking ideation was purely mine.
    // Make request to backend server, the client is beast(the-http-server) it self, lesssgoooo
fetch(`${config.backendUrl}/api/v1/beasty/check`, {
        method: "GET",
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Accept': 'application/json'
                    },
        signal: controller.signal
    })
    .then(async (beResponse) => {
        // Clear the timeout since we got a response
        clearTimeout(timeout);
        
                // Check if response is JSON
                const contentType = beResponse.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error(`Invalid response type from backend: ${contentType}`);
                }
                
                // Convert backend response to JSON
        const beData = await beResponse.json();
                
                // Validate the response structure
                if (!beData || typeof beData !== 'object') {
                    throw new Error('Invalid response format from backend');        // backend can sometimes send HTML in place of json and hats bad
                }
    
    // Calculate how long the server has been running, beasty the mathematician
    const beastyUptimeSeconds = Math.floor(
        (Date.now() - global.beastyStartTime) / 1000        // in seconds btw if anyones asking...
    );
    
    // Get the user's browser/device info
    const userAgent = extractUserAgent(f);
    
    // Get the user's IP address
    const ip = l.remoteAddress || "Unknown";
    
    // Parse the URL to check for query parameters
    const urlParts = i.split("?");
    const queryString = urlParts[1] || "";
    
    // Check if user wants to see their IP
    const showIP = queryString.includes("withIP=true");
    
    const metadata = {
        timestamp: new Date().toISOString(),
        userAgent,
        ip: showIP ? ip : "Only shown if you ask with ?withIP=true",
        note: "You're seeing this because you're authenticated. This request is real-time and tracked per user."
    };

    const userInfo = {
        firstRequestAt: beData.data?.firstRequestAt || null,
        serverUptime: `${beastyUptimeSeconds} seconds`,
        userId: beData.data?.userId || null,
        remainingRequests: beData.data?.remainingRequests || null
    };

    const body = JSON.stringify({ metadata, userInfo });
    
    // Apply compression if enabled, gzip 
    if (config.compression.enabled) {
        const compressedBody = zlib.gzipSync(body);
        const headers = [
            "HTTP/1.1 200 OK",
            "Content-Type: application/json",
            "Content-Encoding: gzip",
            ...corsHeaders(origin),
            ...securityHeaders,
            `Content-Length: ${compressedBody.length}`,
            "",
            ""
        ].join("\r\n");
        l.write(headers);
        l.write(compressedBody);
    } else {
        const headers = [
            "HTTP/1.1 200 OK",
            "Content-Type: application/json",
            ...corsHeaders(origin),
            ...securityHeaders,
            `Content-Length: ${Buffer.byteLength(body)}`,
            "",
            body
        ].join("\r\n");
        l.write(headers);
    }
    l.end();
})
.catch((err) => {
    clearTimeout(timeout);
    const body = JSON.stringify({ 
        error: "Beasty Error", 
        details: "You have used all 4 of your allowed Beasty requests." 
    });
    
    const response = [
        "HTTP/1.1 403 Forbidden",
        "Content-Type: application/json",
        ...corsHeaders(origin),
        ...securityHeaders,
        `Content-Length: ${Buffer.byteLength(body)}`,
        "",
        body
    ].join("\r\n");
    
    // Write response and end connection properly
    l.write(response, () => {
    l.end();
    });
});
return;
}

// Default 404 response
const body = JSON.stringify({ error: "Not Found" });
const response = [
    "HTTP/1.1 404 Not Found",
    "Content-Type: application/json",
    ...corsHeaders(origin),
    ...securityHeaders,
    `Content-Length: ${Buffer.byteLength(body)}`,
    "",
    body
].join("\r\n");
l.write(response);
l.end();
});
});

// Helper function for user agent extraction, very impppp
function extractUserAgent(headers) {
    const line = headers.find(l => l.toLowerCase().startsWith("user-agent:"));
    return line ? line.split(":").slice(1).join(":").trim() : "Unknown";
}

server.listen(config.port, () => {
    console.log(`Beasty HTTP server running on port ${config.port}`);
});