const fetch = require("node-fetch");
const net = require("net"); // Imports Node’s net module, lets us create low-level TCP servers and clients. working directly w sockets and no http abstractions
// const zlib = require("zlib");      // for gzip compressions

console.log("Logs from your program will appear here!");

var N = net.createServer((l) => {   // a new TCP server created
  l.on("data", (b) => {             // l is listening to incoming req from client and the data arrives in chunks (b is a Buffer).
    const f = b.toString().split("\r\n"),           // let an array f, then convert b chunks into strings                 
      [j, i, q] = f[0].split(" ");                  // split the string into diff parts of the request like http method = j, path = i, http version = q 
    // GET    /beasty     HTTP/1.1
      
      //  currently only allowing GET nothing else
    const allowedMethods = ["GET"];

    // if the request method is not allowed, return a 405 error
    if (!allowedMethods.includes(j)) {
      const methodNotAllowedResponse = [
        "HTTP/1.1 405 Method Not Allowed",  // HTTP status
        "Content-Type: text/plain",         
        `Content-Length: ${j.length + 26}`, // calculate length of the message body
        "",                                 // empty line to separate headers from body
        `${j} requests are not allowed.`    // body message
      ].join("\r\n");

      l.write(methodNotAllowedResponse);    // Send the response
      l.end();                             
      console.log(`Blocked ${j} request`);  
      return;                               
    }
    console.log({ method: j, path: i, version: q });




    const acceptEncodingLine = f.find(line => line.toLowerCase().startsWith("accept-encoding:"));
    const acceptEncoding = acceptEncodingLine ? acceptEncodingLine.split(":")[1].trim() : "";
    const supportsGzip = acceptEncoding.includes("gzip");

    
    let w = "HTTP/1.1 404 Not Found\r\n\r\n";



    // Handle /beasty route
    if (i === "/beasty") {
      // extracts authorization header from the incoming request lines
      const authLine = f.find(line => line.toLowerCase().startsWith("authorization:"));
      const token = authLine ? authLine.split(" ")[2] : null;       // and give null if not get token

      // If no token provided, respond with 401 Unauthorized
      if (!token) {
        const response = [
          "HTTP/1.1 401 Unauthorized",
          "Content-Type: application/json",
          "",
          JSON.stringify({ error: "Authorization token missing" })
        ].join("\r\n");
        l.write(response);
        l.end();
        return;
      }
       // beasty(the http server) becomes the client of backend(be) and asks for the user eligiblity
      // call  backend(be)  (/beasty/check) endpoint to verify user eligibility
      fetch("http://localhost:4000/api/v1/beasty/check", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(async (beResponse) => {
        if (beResponse.status === 200) {            // if (backend) be says yes
          const beData = await beResponse.json();
           
          // then start extracting stuff from user to astonish them lol

          // extract User-Agent from request headers
          // and to include the user’s agent in the response payload.
         // helper function to safely extract the user agent from headers
         function extractUserAgent(headers) {
         const line = headers.find(l => l.toLowerCase().startsWith("user-agent:"));
        return line ? line.split(":").slice(1).join(":").trim() : "Unknown";
      }
                const userAgent = extractUserAgent(f);    // safely extract user agent

          // extract IP from socket remote address
          const ip = l.remoteAddress || "Unknown";

          // parse query parameters to check for withIP=true
          const urlParts = i.split("?");                // look for thier consent if given
          const queryString = urlParts[1] || "";
          const showIP = queryString.includes("withIP=true");       // If yes, we’ll show it; if no, we hide it.

          const responseBody = {
            timestamp: new Date().toISOString(),
            userAgent,
            ip: showIP ? ip : "Only shown if you ask with ?withIP=true",
            note: "You're seeing this because you're authenticated. This request is real-time and tracked per user.",
            firstRequestAt: beData.firstRequestAt || null,
            serverUptime: beData.serverUptime || null,
            userId: beData.userId || null
          };

          const body = JSON.stringify(responseBody);
          const headers = [
            "HTTP/1.1 200 OK",
            "Content-Type: application/json",
            `Content-Length: ${Buffer.byteLength(body)}`
          ].join("\r\n");

          l.write(headers + "\r\n\r\n" + body);
          l.end();
        } else if (beResponse.status === 403) {

          // if backend responds 403 Forbidden, send a corresponding forbidden response
          const body = JSON.stringify({ error: "One-time request already used" });
          const headers = [
            "HTTP/1.1 403 Forbidden",
            "Content-Type: application/json",
            `Content-Length: ${Buffer.byteLength(body)}`
          ].join("\r\n");

          l.write(headers + "\r\n\r\n" + body);
          l.end();
        } else {

          // for other error statuses, forward the error text back to client
          const text = await beResponse.text();
          const headers = [
            `HTTP/1.1 ${beResponse.status} Error`,
            "Content-Type: text/plain",
            `Content-Length: ${Buffer.byteLength(text)}`
          ].join("\r\n");

          l.write(headers + "\r\n\r\n" + text);
          l.end();
        }
      })
      .catch((err) => {

        // handling fetch or internal errors with a 500 response
        const body = JSON.stringify({ error: "Internal server error", details: err.message });
        const headers = [
          "HTTP/1.1 500 Internal Server Error",
          "Content-Type: application/json",
          `Content-Length: ${Buffer.byteLength(body)}`
        ].join("\r\n");

        l.write(headers + "\r\n\r\n" + body);
        l.end();
      });

      // exit early since response is handled asynchronously
      return;
    }

    /*

    //// this is for the res of a normal home page saying hello world!

    if (i === "/") {
      let body = "<html><body><h1>Hello World</h1></body></html>";
      if (supportsGzip) {
        const compressedBody = zlib.gzipSync(body);
        const headers = [
          "HTTP/1.1 200 OK",
          "Content-Type: text/html",
          "Content-Encoding: gzip",
          `Content-Length: ${compressedBody.length}`,
          "",
          ""
        ].join("\r\n");
        l.write(headers);
        l.write(compressedBody);
        l.end();
        console.log("messaged");
        return;
      } else {
        w =
          "HTTP/1.1 200 OK\r\n\r\n" + body;
      }
    } 
      
    

    //// this is for echo, the one that sends back exactly what you give, echoes basically!

    else {
        // now lets talk abt response
        // echo is used cause it sends back exactly what was sent in the first place

      const echoMatch = i.match(/\/echo\/(.*)/);      // a regular expression to match and extract anything after /echo/ in the path
      if (echoMatch) {
        const echoText = echoMatch[1];
        if (supportsGzip) {
          const compressedBody = zlib.gzipSync(echoText);
          const headers = [
            "HTTP/1.1 200 OK",
            "Content-Type: text/plain",
            "Content-Encoding: gzip",
            `Content-Length: ${compressedBody.length}`,
            "",
            ""
          ].join("\r\n");
          l.write(headers);
          l.write(compressedBody);
          l.end();
          console.log("messaged");
          return;
        } else {
          w = [
            "HTTP/1.1 200 OK",                 // the magical response
            "Content-Type: text/plain",
            `Content-Length: ${echoText.length}`,
            "",
            echoText,
          ].join("\r\n");
        }      }
*/
      else if (i === "/user-agent") {
        const userAgent = extractUserAgent(f);
         w = [
          "HTTP/1.1 200 OK",
          "Content-Type: text/plain",
          `Content-Length: ${userAgent.length}`,
          "",
          userAgent,
        ].join("\r\n");
      }

/*

    //// used in POST reqs for posting files


            else if (i.startsWith("/files/")) {              // if path starts with /file then we gotta know  that client wanna get a doomed file from our server
        const path = require("path");
        const fs = require("fs");
        const filename = i.replace("/files/", "");           // extracts just the filename from the path
        const directoryFlagIndex = process.argv.indexOf("--directory");
        const directoryPath = directoryFlagIndex !== -1 ? process.argv[directoryFlagIndex + 1] : null;

        if (!directoryPath) {
          w = "HTTP/1.1 500 Internal Server Error\r\n\r\nDirectory not specified.";
        } else {
          const fullPath = path.join(directoryPath, filename);
        if (j === "POST") {
          w = "HTTP/1.1 405 Method Not Allowed\r\n\r\nPOST requests are disabled.";
         } else {
            try {
              const fileContent = fs.readFileSync(fullPath);
              if (supportsGzip) {
                const compressedBody = zlib.gzipSync(fileContent);
                const headers = [
                  "HTTP/1.1 200 OK",
                  "Content-Type: application/octet-stream",
                  "Content-Encoding: gzip",
                  `Content-Length: ${compressedBody.length}`,
                  "",
                  ""
                ].join("\r\n");
                l.write(headers);
                l.write(compressedBody);
                l.end();
                console.log("messaged");
                return;
              } else {
                w = [
                  "HTTP/1.1 200 OK",
                  "Content-Type: application/octet-stream",
                  `Content-Length: ${fileContent.length}`,
                  "",
                  fileContent,
                ].join("\r\n");
              }            } catch (err) {
              w = "HTTP/1.1 404 Not Found\r\n\r\n";
            }          }
        }
      }
    }
    */
 
    l.write(w);                    // 	w is a string holding the full HTTP response (status line, headers, and body)
    l.end();                  
    console.log("messaged");    // send the res back to client and cuts the connection
  });

  l.on("close", () => {
    l.end();                   
  });
});

N.listen(8000, "localhost");      /// starts the TCP server and now the beast is ready to listen to your polite requests. this happened all before this req res game started]