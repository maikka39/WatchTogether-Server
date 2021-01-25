const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
const { logger } = require("./utils/logger");

const { sanitize } = require("./utils/sanitize");

const { PORT, ADMIN_USER } = require("./config");

const { Users } = require("./users");

const router = require("./router");

logger.info("Starting server...");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);
app.use(cors());

io.on("connection", (socket) => {
  try {
    logger.info({
      info: {
        event: "connection",
        id: socket.id,
        ip: socket.conn.remoteAddress,
      }
    });

    socket.on("join", ({ room, name }, joinCallback) => {
      try {
        logger.info({
          info: {
            event: "join",
            id: socket.id,
            name,
            room,
          }
        });

        let userMoved = false;

        if (Users.exists(socket.id)) {
          userMoved = true;

          var { error, user } = Users.move(socket.id, room)

          for (let room in socket.rooms) {
            if (room !== socket.id && room !== user.room) {
              socket.leave(room);

              io.to(room).emit("message", {
                user: ADMIN_USER,
                text: `${user.name} has left.`,
              });

              io.to(room).emit("usersUpdated", {
                users: Users.getFromRoom(room),
              });
            }
          }

        } else {
          var { error, user } = Users.add(socket.id, name, room);
        }

        if (error) {
          joinCallback(error);
          return;
        }

        socket.join(user.room);

        io.to(user.room).emit("usersUpdated", {
          users: Users.getFromRoom(user.room),
        });

        // socket.emit('message', {
        //   user: ADMIN_USER,
        //   text: `Welcome ${user.name}, you're in room ${user.room}.`
        // })

        socket.broadcast.to(user.room).emit("message", {
          user: ADMIN_USER,
          text: `${user.name} has joined!`,
        });

        if (userMoved) {
          joinCallback();
          return;
        }

        socket.on("message", ({ text }, callback) => {
          try {
            logger.info({
              info: {
                event: "message",
                id: user.id,
                text,
              }
            });

            text = sanitize(text);

            io.to(user.room).emit("message", {
              user: user.name,
              text,
            });

            callback();
          } catch (error) {
            logger.error(error)
          }
        });

        socket.on("play", ({ progress }) => {
          try {
            logger.info({
              info: {
                event: "play",
                id: user.id,
                room: user.room,
                progress,
              }
            });

            io.to(user.room).emit("play", {
              progress,
            });
          } catch (error) {
            logger.error(error)
          }
        });

        socket.on("pause", ({ progress }) => {
          try {
            logger.info({
              info: {
                event: "pause",
                id: user.id,
                room: user.room,
                progress,
              }
            });

            io.to(user.room).emit("pause", {
              progress,
            });
          } catch (error) {
            logger.error(error)
          }
        });

        socket.on("changeVideo", ({ url }) => {
          try {
            logger.info({
              info: {
                event: "changeVideo",
                id: user.id,
                room: user.room,
                url,
              }
            });

            io.to(user.room).emit("changeVideo", {
              url,
            });
          } catch (error) {
            logger.error(error)
          }
        });

        socket.on("sync", ({ url, progress, playing }) => {
          try {
            logger.info({
              info: {
                event: "sync",
                id: user.id,
                room: user.room,
                url,
                progress,
                playing,
              }
            });

            io.to(user.room).emit("sync", {
              url,
              progress,
              playing,
            });
          } catch (error) {
            logger.error(error)
          }
        });

        socket.on("disconnect", () => {
          try {
            logger.info({
              info: {
                event: "disconnect",
                id: socket.id,
              }
            });

            if (!user) {
              return;
            }

            Users.remove(user.id)

            io.to(user.room).emit("message", {
              user: ADMIN_USER,
              text: `${user.name} has left.`,
            });

            io.to(user.room).emit("usersUpdated", {
              users: Users.getFromRoom(user.room),
            });
          } catch (error) {
            logger.error(error)
          }
        });

        joinCallback();

      } catch (error) {
        logger.error(error)
      }
    });
  } catch (error) {
    logger.error(error)
  }
});

server.listen(PORT, () => logger.info(`Server has started on port ${PORT}`));
