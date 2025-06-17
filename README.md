beasty

A custom HTTP server written from scratch using raw TCP sockets — with a heavy focus on security, rate limiting, and controlled request flows.

You can:
	•	Log in securely via JWT
	•	Hit 3 predefined endpoints
	•	View your own request metadata
	•	And do it all within a 4 requests/week/IP limit

Strict? Yeah. But that’s the point.

⸻

Why i made this?

I built beasty as a challenge through CodeCrafters, inspired by a desire to go low-level — and a craving to showcase that work live on the internet.

And it really seemed ineresting which it absolutely was!!!

⸻

How It Works

	•	written in Node.js, using net module (no HTTP wrappers).
	•	Processes requests manually from buffer chunks. 
	•	Splits them into its HTTP method, path, headers, body and version.
	•	JWT-authenticated requests only (made a whole diff backend folder for this)

	•	3 hardcoded endpoints:
    
	           1.	/greeting
	           2.	/beasty — user metadata (no IP)
	           3.	/beasty?withIP=true — full metadata (with IP)

No user can hit custom URLs. Only these endpoints are allowed. That’s not a bug, that’s a feature. For atmost Security.

⸻

Real Struggles

	•	TCP-level rate limiting was too good — slowed everything down, so had to remove it.
	•	CORS & CSP hell — made worse by 3 separate services (frontend, backend, beasty)
	•	Dev Auth Hell — logged in so many times that i cant explain!
	•	Socket end states were bad, they issued a lot of bugs.
    
⸻

What did i learn?

I leanred a lot building this project cause the logic was to determined by me only cause nobody has made this kinda thing or maybe i just dont know, but yeah all the customization, flow of requests + response were a part of learning which i did nicely.

some great stuff i learned about was -

1. rate-limiting,
2. IP level rate-limiting
3. TCP level rate-limiting
4. sanitization
5. gzip compression
6. timeouts
7. connecting 2 backends with one frontend
8. API integration at it peak
9. CORS & CSP are bad

i have typed my whole journey is throughout this project in this notion doc -

Read full [Documentation](https://cypress-cayenne-00d.notion.site/Making-of-beasty-2145118366ab809d91c1d42dd96cc57a). 
