const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
const logger = require("./utils/logger");

const {
  sanitizeMessage
} = require('./utils/sanitize');

const {
  PORT,
  ADMIN_USER
} = require("./config")

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require("./users");

const router = require("./router")

logger.info("Starting server...")

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);
app.use(cors());

io.on("connection", (socket) => {
  logger.info("New connection: %s", JSON.stringify({
    id: socket.id,
    ip: socket.conn.remoteAddress,
  }));

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

    socket.join(user.room);

    io.to(user.room).emit("newUser", {
      users: getUsersInRoom(user.room)
    })

    // socket.emit('message', {
    //   user: ADMIN_USER,
    //   text: `Welcome ${user.name}, you're in room ${user.room}.`
    // })

    socket.broadcast.to(user.room).emit('message', {
      user: ADMIN_USER,
      text: `${user.name} has joined!`
    })

    callback();
  })

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    text = sanitizeMessage(message.text);

    io.to(user.room).emit('message', {
      user: user.name,
      text
    });

    logger.info("Message: %s", JSON.stringify({
      id: socket.id,
      text
    }));

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    logger.info("User left: %s", JSON.stringify({
      id: socket.id
    }))

    if (user) {
      io.to(user.room).emit('message', {
        user: ADMIN_USER,
        text: `${user.name} has left.`
      });
      io.to(user.room).emit('roomData', {
        users: getUsersInRoom(user.room)
      });
    }

  })
})

server.listen(PORT, () => logger.info(`Server has started on port ${PORT}`));