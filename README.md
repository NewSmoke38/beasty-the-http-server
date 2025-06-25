# beasty

A custom HTTP server written from scratch using raw TCP sockets — with a heavy focus on security, rate limiting, and controlled request flows.

### You can:

- Log in securely via JWT
- Hit 3 predefined endpoints
- View your own request metadata
- And do it all within a 4 requests/week/IP limit

Strict? Yeah. But that's the point.


# Why I made this?

I built beasty as a challenge through CodeCrafters, inspired by a desire to go low-level — and a craving to showcase that work live on the internet.

And it really seemed interesting, which it absolutely was!!!


# How It Works

Written in Node.js, using net module (no HTTP wrappers).
Processes requests manually from buffer chunks.
Splits them into its HTTP method, path, headers, body, and version.

1. JWT-authenticated requests only (made a whole separate backend folder for this)

2. 3 hardcoded endpoints:
	-	/greeting
	-	/beasty — user metadata (no IP)
	-	/beasty?withIP=true — full metadata (with IP)

3.	No user can hit custom URLs. Only these endpoints are allowed. That's not a bug, that's a feature. For atmost security.

# Real Struggles

- TCP-level rate limiting was too good — slowed everything down, so had to remove it.

- CORS & CSP hell — made worse by 3 separate services 
(frontend, backend, beasty)

- Dev Auth Hell — logged in so many times for testing that I can't explain!

- Socket end states were bad, they issued a lot of bugs.

# Technical Achievements:

1. Zero external HTTP dependencies
2. Real-time metadata tracking
3. Gzip compression with configurable levels
4. Custom error handling with detailed messages
5. Privacy-first logging (no IP storage)

# What Did I Learn?

I learned a lot building this project — the logic was determined by me alone (i am proud of it). Maybe nobody has made this exact kind of thing (or maybe I just haven't seen it), but yeah, all the customization, the flow of requests + responses — I figured out myself, and it was a solid learning.

### Here's what I picked up:

1.	Rate-limiting
2.	IP-level rate-limiting
3.	TCP-level rate-limiting
4.	Input sanitization
5.	Gzip compression
6.	Handling timeouts
7.	Connecting two backends with one frontend
8.	API integration at its peak
9.	CORS & CSP are bad



# Local Setup

```bash
# Clone & install
git clone https://github.com/NewSmoke38/beasty-the-http-server.git
cd beasty-the-http-server

# Dependencies

## Backend Dependencies 

```bash
cd backend && npm install

**bcrypt**, **cors**, **dotenv**, **express**, **jsonwebtoken**, **mongoose**, **nodemon**
```

## Beasty Dependencies
```bash
cd beasty && npm install

**jsonwebtoken**, **node-fetch**, **nodemon**
```

## Frontend Dependencies
```bash
cd frontend && npm install

**axios**, **jwt-decode**, **react**, **react-dom**, **vite**, **eslint** 
```


## Run in 4 terminals:

**Terminal 1 - Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend && npm run dev
```

**Terminal 3 - Beasty server:**
```bash
cd beasty && ./your_program.sh
```

**Terminal 4 - Beasty requests:**
```bash
cd beasty && your curl request
```




Read the full [Documentation](https://cypress-cayenne-00d.notion.site/Making-of-beasty-2145118366ab809d91c1d42dd96cc57a)
