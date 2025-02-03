const http = require("http");
const fs = require("fs");
const socketIO = require("socket.io");

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    fs.readFile(__dirname + "/index.html", (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Error loading index.html");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
    });
  }
});

//Enable CORS for WebSockets
const io = socketIO(server, {
  cors: {
    origin: "*", // Allow requests from anywhere
    methods: ["GET", "POST"]
  }
});

const port = 5000;

// Handle incoming socket connections
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("send message", (chatData) => {
    io.emit("send message", chatData);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server is listening on port ${port}`);
});
