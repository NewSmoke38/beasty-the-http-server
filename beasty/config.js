export const config = {
    port: process.env.PORT || 8000,

    backendUrl: process.env.BACKEND_URL || 'https://beasty-backend.onrender.com',

    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',

    corsOrigins: process.env.CORS_ORIGINS?.split(',') || [
        'http://localhost:5174',
        'http://localhost:3000',
        'http://localhost:5173',
        'https://beasty-frontend.vercel.app'  // Vercel production URL (uwu)
    ],

    // Rate limiting settings from IP
    rateLimit: {
        // This is how long we track requests from each IP (3 min)
        windowMs: 3 * 60 * 1000,

        // maximum number of requests allowed per ip in the time window
        max: 4
    },

    // How long to wait for a response before timing out (5 secs)
    timeout: 5000,


    // Gzip compression 
    compression: {
        // Whether to compress responses
        enabled: true,

        // Compression level (1-9)
        // 1 = fastest but least compression
        // 9 = slowest but best compression
        // 6 is a good balance
        level: 6
    },


    // IP Access control
    ipAccess: {
        whitelist: [],
        
        blacklist: [],
        
        enabled: true
    },

    // Request throttling (good)
    throttling: {
        minTimeBetweenRequests: 1000,  // 1 second
        
        enabled: true
    }
};