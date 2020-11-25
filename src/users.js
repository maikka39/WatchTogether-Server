const { logger } = require("./utils/logger");
const { ADMIN_USER } = require("./config");
const { sanitize } = require("./utils/sanitize");

class User {
  constructor(id, name, room) {
    this.id = id;
    this.name = name;
    this.room = room;
  }
}

class Users {
  constructor() {
    this.users = [];
  }

  exists(id) {
    return this.users.findIndex((user) => user.id === id) !== -1;
  }

  get(id) {
    return this.users.find((user) => user.id === id)
  }

  move(id, room) {
    let user = this.users.find((user) => user.id === id);

    if (!user) return { error: "User not found" };

    let { error } = this._verifyUser(id, user.name, room);
    if (error) return { error };
    
    user.room = room;

    return { user };
  }

  add(id, name, room) {
    let { error } = this._verifyUser(id, name, room);
    if (error) return { error };
    
    let user = new User(id, name, room);

    this.users.push(user)

    return { user };
  }

  remove(id) {
    const i = this.users.findIndex((user) => user.id === id);

    if (i !== -1) {
      return this.users.splice(i, 1)[0];
    }
  }

  getFromRoom(room) {
    return this.users.filter((user) => user.room === room);
  }

  _verifyUser(id, name, room) {
    if (
      name === ADMIN_USER ||
      this.users.find((user) => user.room === room && user.name === name && user.id !== id)
    ) {
      return {
        error: "Username is taken",
      };
    }

    return {}
  }
}

module.exports = {
  User,
  Users: new Users(),
};
