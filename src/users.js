const { logger } = require("./utils/logger");
const { ADMIN_USER } = require("./config");
const { sanitize } = require("./utils/sanitize");

const users = [];

function addUser({ id, name, room }) {
  name = sanitize(name);
  room = sanitize(room);

  if (
    name === ADMIN_USER ||
    users.find((user) => user.room === room && user.name === name)
  ) {
    return {
      error: "Username is taken",
    };
  }

  const user = {
    id,
    name,
    room,
  };

  logger.info("User joined: %s", JSON.stringify(user));

  users.push(user);

  return {
    user,
  };
}

function removeUser(id) {
  const i = users.findIndex((user) => user.id === id);

  if (i !== -1) {
    return users.splice(i, 1)[0];
  }
}

function getUser(id) {
  return users.find((user) => user.id === id);
}

function getUsersInRoom(room) {
  return users.filter((user) => user.room === room);
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
