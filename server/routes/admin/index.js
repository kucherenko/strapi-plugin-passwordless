'use strict';

const settingsRoutes = require('./settings');

module.exports = {
  type: 'admin',
  routes: [...settingsRoutes],
};