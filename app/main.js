const net = require("net");    // Imports Node’s net module, lets us create low-level TCP servers and clients. working directly w sockets and no http abstractions
console.log("Logs from your program will appear here!");
var N = net.createServer((l) => {           //  a new TCP server created
  l.on("data", (b) => {                     //  l is listening to incoming req from client and the data arrives in chunks (b is a Buffer).
    const f = b.toString().split("\r\n"),      // // let an array f, then convert b chunks into strings                 
      [j, i, q] = f[0].split(" ");            // split the string into diff parts of the request like http method = j, path = i, http version = q 
    console.log({ method: j, path: i, version: q });

    let w = "HTTP/1.1 404 Not Found\r\n\r\n";
    if (i === "/") {
      w =
        "HTTP/1.1 200 OK\r\n\r\n<html><body><h1>Hello World</h1></body></html>";
    } else {
        // now lets talk abt response
        // echo is used cause it sends back exactly what was sent in the first place
      const echoMatch = i.match(/\/echo\/(.*)/);      // a regular expression to match and extract anything after /echo/ in the path
      if (echoMatch) {
        const echoText = echoMatch[1];
        w = [
          "HTTP/1.1 200 OK",                 // the magical response
          "Content-Type: text/plain",
          `Content-Length: ${echoText.length}`,
          "",
          echoText,
        ].join("\r\n");

        // user agent is basically  just what machine + software knocked on the server’s door. (browser name)
      } else if (i === "/user-agent") {
        const userAgentLine = f.find(line => line.toLowerCase().startsWith("user-agent:"));
        const userAgent = userAgentLine ? userAgentLine.split(": ")[1] : "Unknown";              // if user agent found then okay or if not then fallback on "unknown"
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
        const directoryFlagIndex = process.argv.indexOf("--directory");      // searches the directory flag in the server
        const directoryPath = directoryFlagIndex !== -1 ? process.argv[directoryFlagIndex + 1] : null;         // if --directory was found, get the path immediately after it — e.g., /tmp/

        if (!directoryPath) {
          w = "HTTP/1.1 500 Internal Server Error\r\n\r\nDirectory not specified.";
        } else {
          const fullPath = path.join(directoryPath, filename);         // combine the directoryPath and filename
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
              const fileContent = fs.readFileSync(fullPath, "utf8");
              w = [
                "HTTP/1.1 200 OK",
                "Content-Type: application/octet-stream",
                `Content-Length: ${fileContent.length}`,
                "",
                fileContent,
              ].join("\r\n");
            } catch (err) {
              w = "HTTP/1.1 404 Not Found\r\n\r\n";
            }          }
        }
      }
    }

    
 
    

    l.write(w);
    l.end();
    console.log("messaged");
  });

  l.on("close", () => {
    l.end();
    // N.close(); <-- REMOVE this
  });
});

N.listen(8000, "localhost");
