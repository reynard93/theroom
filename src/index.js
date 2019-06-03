const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const {
  generateMessage,
  generateLocationMessage
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", socket => {
  console.log("New websocket connection");
  //send an event from server

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    // socket.emit("message", generateMessage("Hi Doggie!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(`Oh Hai ${user.username}!`, user.username)
      );
    //socket.emit, io.emit, socket.broadcast.emit
    //..., io.to.emit, socket.broadcast.to.emit
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })
    callback();
  });

  socket.on("sendMessage", (reply, audiof, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", generateMessage( audiof, reply, user.username));
    callback();
  });

  //built in event for disconnection so name have to match exactly
  //no need to emit either conneciton/disconneciton from client as these are built in events and the library takes control over the emission
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(
          `Bye ${user.username}! you are our fav customer`
        )
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  });

  socket.on("sendLocation", (position, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${position.latitude},${position.longitude}`
      )
    );

    callback();
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
  console.log(publicDirectoryPath);
});
