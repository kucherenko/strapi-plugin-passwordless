'use strict';

const authRoutes = require('./auth');

module.exports = {
  type: 'content-api',
  routes: [...authRoutes],
};