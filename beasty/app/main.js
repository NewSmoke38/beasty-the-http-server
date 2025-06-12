const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const net = require("net");
const zlib = require("zlib");       // for gzip compression
const { config } = require('../config.js');
const jwt = require('jsonwebtoken');
console.log("Logs from your program will appear here!");

// CORS headers
const corsHeaders = [
    // Allows specific websites to access your server
    "Access-Control-Allow-Origin: " + config.corsOrigins.join(", "),
    "Access-Control-Allow-Methods: GET",       // only GET allowed 
    "Access-Control-Allow-Headers: Content-Type, Authorization",
    // for how much time should the browser cache these data, we will do it for 24 hrs
    "Access-Control-Max-Age: 86400"
];

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

// Set up a cleanup interval that runs every 60 seconds (60000 milliseconds)
const cleanupInterval = setInterval(() => {
    // Get current timestamp in milliseconds
    const now = Date.now();

    for (const [ip, data] of requestCounts.entries()) {          // ip is key, data is value
        // Check if this IP's last request was more than windowMs ago
        // windowMs is 15 minutes (15 * 60 * 1000 milliseconds) 
        if (now - data.timestamp > config.rateLimit.windowMs) {
            // If yes, remove this IP from the Map
            // This prevents the Map from growing infinitely
            requestCounts.delete(ip);
        }
    }
}, 60000); // Run this cleanup every 60 seconds



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





// Create a new TCP server using Node's net module
// 'l' is the socket connection for each client
const server = net.createServer((l) => {
    // data is received from the client in form of 'b' = is the raw buffer data incoming
    l.on("data", (b) => {
        const ip = l.remoteAddress;
        
        // check if IP is blocked first, before any other processing
        if (ipBlockList.has(ip)) {
            const blockData = ipBlockList.get(ip);
            if (blockData.blockedUntil > Date.now()) {
                // just destroy the connection without any response
                l.destroy();
                return;
            } else {
                ipBlockList.delete(ip);
            }
        }

        const f = b.toString().split("\r\n");   // b comes in packets so need to get converted into string
        //  the first line of the HTTP request is split up into many strings from the one main string
        // j = HTTP method (GET, POST, etc.)
        // i = path (/beasty, /echo, etc.)
        // q = HTTP version (HTTP/1.1)
        const [j, i, q] = f[0].split(" ");
        
        // Rate limiting implementation
        // Get current timestamp
        const now = Date.now();
        
        // Get existing request count for this IP or create new if none exists
        // If no entry exists, create one with count 0 and current timestamp
        const userRequests = requestCounts.get(ip) || { count: 0, timestamp: now };
        
        // Check if it's been more than the rate limit window (15 minutes)
        if (now - userRequests.timestamp > config.rateLimit.windowMs) {
            // If yes, reset the count to 1 and update timestamp
            userRequests.count = 1;
            userRequests.timestamp = now;
        } else {
            // If no, increment the count
            userRequests.count++;
        }
        
        // Save the updated request count back to our Map
        requestCounts.set(ip, userRequests);
        
        // When rate limit is exceeded (5th request)
        if (userRequests.count > config.rateLimit.max) {
            // Block the IP for 3 minutes
            ipBlockList.set(ip, {
                blockedUntil: Date.now() + (3 * 60 * 1000), // 3 minutes
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
                ...corsHeaders,
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


    // allowed stuff 
    // GET: for getting data
    // OPTIONS: special req for checking what methods are allowed (used by browsers for CORS)
    const allowedMethods = ["GET", "OPTIONS"];

    if (j === "OPTIONS") {
        const response = [
            "HTTP/1.1 204 No Content",
            
            // Add our CORS headers so browser knows what's allowed
            ...corsHeaders,
            
            // Add security headers
            ...securityHeaders,
            
            // Since there's no content, length is 0
            "Content-Length: 0",
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
            ...corsHeaders,
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
                const token = authLine ? authLine.split(" ")[2] : null;
                
                if (!token) {
                    const body = JSON.stringify({ 
                        error: "Authorization token missing" 
                    });
                    
                    const response = [
                        "HTTP/1.1 401 Unauthorized",
                        "Content-Type: application/json",
                        ...corsHeaders,
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
                    
                    if (!beResponse.ok) {
                        throw new Error('You have already used your one-time Beasty GET request.');
                    }

                    const beData = await beResponse.json();
                    // if token is good
                    const body = JSON.stringify({ 
                        message: "hello user",
                        userId: beData.data?.userId || null
                    });
                    
                    const response = [
                        "HTTP/1.1 200 OK",
                        "Content-Type: application/json",
                        ...corsHeaders,
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
                    const body = JSON.stringify({ 
                        error: "Beasty Error", 
                        details: err.message 
                    });
                    
                    const response = [
                        "HTTP/1.1 401 Unauthorized",
                        "Content-Type: application/json",
                        ...corsHeaders,
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


    // actual endpoint hitting starts here, w a user asking for magic basically lol
             // Handle /beasty route
        if (i.startsWith("/beasty")) {
          // extracts authorization header from the incoming request lines
          const authLine = f.find(line => line.toLowerCase().startsWith("authorization:"));
          const token = authLine ? authLine.split(" ")[2] : null;       // and give null if not get token
                 
    if (!token) {
        const body = JSON.stringify({ 
            error: "Authorization token missing" 
        });
        
        const response = [
            "HTTP/1.1 401 Unauthorized",
            "Content-Type: application/json",
            ...corsHeaders,
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
    const userAgent = extractUserAgent(f);          // oooo shady, actually 
    
    // Get the user's IP address
    const ip = l.remoteAddress || "Unknown";
    
    // Parse the URL to check for query parameters
    const urlParts = i.split("?");
    const queryString = urlParts[1] || "";
    
    // Check if user wants to see their IP, we dont keep it so dont worry, we aint hungry dude
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
                    userId: beData.data?.userId || null
                };

                const body = JSON.stringify({ metadata, userInfo });
                
                // Apply compression if enabled, gzip 
                if (config.compression.enabled) {
                    const compressedBody = zlib.gzipSync(body);
                    const headers = [
                        "HTTP/1.1 200 OK",
                        "Content-Type: application/json",
                        "Content-Encoding: gzip",
                        ...corsHeaders,
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
                        ...corsHeaders,
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
                    ...corsHeaders,
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
            ...corsHeaders,
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