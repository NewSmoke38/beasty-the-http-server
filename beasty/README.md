# Beasty HTTP Server

A production-grade HTTP server built from scratch using Node.js net module.

## Features

- Raw HTTP server implementation
- JWT-based authentication
- Rate limiting
- CORS support
- Security headers
- Gzip compression
- Request timeout handling
- Error handling
- IP address tracking
- User agent detection

## Configuration

The server can be configured using environment variables:

- `PORT`: Server port (default: 8000)
- `BACKEND_URL`: Backend API URL (default: http://localhost:4000)
- `CORS_ORIGINS`: Comma-separated list of allowed origins
- `NODE_ENV`: Environment (development/production)

## API Endpoints

### GET /beasty

Returns user metadata and server information.

**Headers Required:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `withIP=true`: Include IP address in response

**Response:**
```json
{
  "metadata": {
    "timestamp": "2025-06-10T10:05:00.322Z",
    "userAgent": "curl/8.7.1",
    "ip": "::1",
    "note": "You're seeing this because you're authenticated. This request is real-time and tracked per user."
  },
  "userInfo": {
    "firstRequestAt": "2025-06-10T10:00:13.178Z",
    "serverUptime": "354 seconds",
    "userId": "6846583ad333fb8dde197c84"
  }
}
```

## Security Features

- Rate limiting (100 requests per 15 minutes per IP)
- CORS protection
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Request timeout (5 seconds)
- Gzip compression
- Error handling

## Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

## Production Deployment

1. Set environment variables:
```bash
export PORT=8000
export BACKEND_URL=https://your-backend.com
export CORS_ORIGINS=https://your-frontend.com
export NODE_ENV=production
```

2. Start the server:
```bash
npm start
```

## Error Handling

The server handles various error scenarios:
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (one-time request already used)
- 404: Not Found
- 405: Method Not Allowed
- 408: Request Timeout
- 429: Too Many Requests
- 500: Internal Server Error
