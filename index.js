const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const morgan = require("morgan");

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require("./users");

const PORT = process.env.PORT || 5000;

const router = require("./router")

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  socket.on("join", ({
    room,
    name
  }, callback) => {
    const {
      error,
      user
    } = addUser({
      id: socket.id,
      name,
      room
    })

    if (error) return callback(error);

    socket.emit('message', {
      user: 'admin',
      text: `Welcome ${user.name}, you're in room ${user.room}.`
    })
    socket.broadcast.to(user.room).emit('message', {
      user: 'admin',
      text: `${user.name} has joined!`
    })

    socket.join(user.room);

    callback();
  })

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', {
      user: user.name,
      message
    });

    console.log("Message send:", {
      id: socket.id,
      message
    })

    callback();
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");

  })
})

app.use(morgan("tiny"));
app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));