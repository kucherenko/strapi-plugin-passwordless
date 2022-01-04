"use strict"

const rateLimit = require("./rateLimit");
const isAuthenticated = require("./isAuthenticated");

module.exports = {
  isAuthenticated,
  rateLimit
};
