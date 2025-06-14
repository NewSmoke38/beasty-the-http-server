export const config = {
    // if PORT is set in .env, use that otherwise use 8000
    port: process.env.PORT || 8000,

    // if BACKEND_URL is set in .env, use that otherwise use localhost:4000
    backendUrl: process.env.BACKEND_URL || 'http://localhost:4000',

    // if CORS_ORIGINS is set in .env, split it by commas into an array
    // otherwise use ['http://localhost:3000']
    // the ?. is optional chaining to safely handle if CORS_ORIGINS is undefined
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],

    // Rate limiting settings from IP
    rateLimit: {
        // 3 minutes in milliseconds (3 * 60 * 1000)
        // This is how long we track request counts for each IP
        windowMs: 3 * 60 * 1000,

        // Maximum number of requests allowed per IP in the time window
        max: 4
    },

    // How long to wait for a response before timing out (5 seconds)
    timeout: 5000,

    // Gzip compression settings
    compression: {
        // Whether to compress responses
        enabled: true,

        // Compression level (1-9)
        // 1 = fastest but least compression
        // 9 = slowest but best compression
        // 6 is a good balance
        level: 6
    },

    // IP Access Control
    ipAccess: {
        // List of trusted IPs that bypass rate limiting
        whitelist: [],
        
        // List of blocked IPs
        blacklist: [],
        
        // Whether to enable IP access control
        enabled: true
    },

    // Request throttling
    throttling: {
        // Minimum time (in milliseconds) between requests from the same IP
        minTimeBetweenRequests: 1000,  // 1 second
        
        // Whether throttling is enabled
        enabled: true
    }
};