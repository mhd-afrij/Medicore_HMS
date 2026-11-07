const bcrypt = require("bcryptjs");

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin26";
const ADMIN_USER = {
  UserID: "admin",
  Username: ADMIN_USERNAME,
  PasswordHash: bcrypt.hashSync(ADMIN_PASSWORD, 10),
  Role: "admin"
};

async function findUserByUsername(username) {

  if (username === ADMIN_USERNAME) {
    return ADMIN_USER;
  }
  return null;
}

async function findUserById(userId) {

  if (userId === ADMIN_USER.UserID) {
    return ADMIN_USER;
  }
  return null;
}

async function createUser() {

  return ADMIN_USER;
}

module.exports = {
  findUserByUsername,
  findUserById,
  createUser
};