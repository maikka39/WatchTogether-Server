const users = [];

function addUser({
  id,
  name,
  room
}) {
  name = name.trim();
  room = room.trim();

  if (users.find((user) => user.room === room && user.name === name)) {
    return {
      error: "Username is taken"
    };
  }

  const user = {
    id,
    name,
    room
  };

  console.log("User joined:", user);

  users.push(user);

  return {
    user
  }
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
  getUsersInRoom
};