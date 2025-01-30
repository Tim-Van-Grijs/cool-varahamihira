const http = require("http");
const fs = require("fs");
const mongoose = require("mongoose"); // Import mongoose

// MongoDB connection setup
mongoose
  .connect("mongodb://localhost:27017/chatroom", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected successfully.");
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });

// Define your schema and model for storing messages in MongoDB
const messageSchema = new mongoose.Schema({
  user: String,
  message: String,
  timestamp: Date,
});

const Message = mongoose.model("Message", messageSchema);

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

const io = require("socket.io")(server);
const port = 5000;

// Handle the username event
io.on("connection", (socket) => {
  socket.on("send name", (user) => {
    io.emit("send name", user);
  });

  // Handle the timestamp event
  socket.on("send timestamp", (timestamp) => {
    io.emit("send timestamp", timestamp);
  });

  // Handle the message event
  socket.on("send message", (chat) => {
    io.emit("send message", chat);

    // Save the message to MongoDB
    const newMessage = new Message({
      user: chat.user,
      message: chat.message,
      timestamp: chat.timestamp,
    });

    newMessage
      .save()
      .then(() => {
        console.log("Message saved to MongoDB!");
      })
      .catch((err) => {
        console.log("Error saving message to MongoDB:", err);
      });
  });
});

server.listen(port, () => {
  console.log(`Server is listening at the port: ${port}`);
});
