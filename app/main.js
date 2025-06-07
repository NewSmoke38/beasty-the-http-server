const net = require("net");    // Imports Node’s net module, lets us create low-level TCP servers and clients. working directly w sockets and no http abstractions
console.log("Logs from your program will appear here!");
var N = net.createServer((l) => {           //  a new TCP server created
  l.on("data", (b) => {                     //  l is listening to incoming req from client and the data arrives in chunks (b is a Buffer).
    const f = b.toString().split("\r\n"),      // // let an array f, then convert b chunks into strings                 
      [j, i, q] = f[0].split(" ");            // split the string into diff parts of the request like http method = j, path = i, http version = q 
    console.log({ method: j, path: i, version: q });

    let w = "HTTP/1.1 404 Not Found\r\n\r\n";
    switch (i) {
      case "/":
        w =
          "HTTP/1.1 200 OK\r\n\r\n<html><body><h1>Hello World</h1></body></html>";
        break;
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
