const net = require("net"); // Imports Node’s net module, lets us create low-level TCP servers and clients. working directly w sockets and no http abstractions
const zlib = require("zlib");
console.log("Logs from your program will appear here!");
var N = net.createServer((l) => {   // a new TCP server created
  l.on("data", (b) => {             // l is listening to incoming req from client and the data arrives in chunks (b is a Buffer).
    const f = b.toString().split("\r\n"),           // let an array f, then convert b chunks into strings                 
      [j, i, q] = f[0].split(" ");                  // split the string into diff parts of the request like http method = j, path = i, http version = q 
    console.log({ method: j, path: i, version: q });



    const acceptEncodingLine = f.find(line => line.toLowerCase().startsWith("accept-encoding:"));
    const acceptEncoding = acceptEncodingLine ? acceptEncodingLine.split(":")[1].trim() : "";
    const supportsGzip = acceptEncoding.includes("gzip");



    let w = "HTTP/1.1 404 Not Found\r\n\r\n";

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
    } else {
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
      else if (i === "/user-agent") {
        const userAgentLine = f.find(line => line.toLowerCase().startsWith("user-agent:"));
        const userAgent = userAgentLine ? userAgentLine.split(": ")[1] : "Unknown";
        w = [
          "HTTP/1.1 200 OK",
          "Content-Type: text/plain",
          `Content-Length: ${userAgent.length}`,
          "",
          userAgent,
        ].join("\r\n");
      }


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
            const body = f[f.length - 1]; // crude way to get request body
            try {
              fs.writeFileSync(fullPath, body);
              w = "HTTP/1.1 201 Created\r\n\r\n";
            } catch (err) {
              w = "HTTP/1.1 500 Internal Server Error\r\n\r\n";
            }
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
    
 
    l.write(w);                    // 	w is a string holding the full HTTP response (status line, headers, and body)
    l.end();                  
    console.log("messaged");    // send the res back to client and cuts the connection
  });

  l.on("close", () => {
    l.end();                   
  });
});

N.listen(8000, "localhost");      /// starts the TCP server and now the beast is ready to listen to your polite requests. this happened all before this req res game started]