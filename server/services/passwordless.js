'use strict';

/**
 * passwordless.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const _ = require("lodash");
const crypto = require("crypto");
const {sanitize} = require('@strapi/utils');

module.exports = (
  {
    strapi
  }
) => {
  return {

    async initialize() {
    },

    settings() {
      const pluginStore = strapi.store({
        environment: '',
        type: 'plugin',
        name: 'passwordless',
      });
      return pluginStore.get({key: 'settings'});
    },

    userSettings() {
      const pluginStore = strapi.store({
        environment: '',
        type: 'plugin',
        name: 'users-permissions',
      });
      return pluginStore.get({key: 'advanced'});
    },

    async isEnabled() {
      const settings = await this.settings();
      return !!settings.enabled;
    },

    async createUser(user) {
      const userSettings = await this.userSettings();
      const role = await strapi
        .query('plugin::users-permissions.role')
        .findOne({type: userSettings.default_role}, []);

      const newUser = {
        email: user.email,
        username: user.username || user.email,
        role: {id: role.id}
      };
      return strapi
        .query('plugin::users-permissions.user')
        .create({data: newUser, populate: ['role']});
    },

    async user(email, username) {
      const settings = await this.settings();
      const {user: userService} = strapi.plugins['users-permissions'].services;
      const user = email ? await userService.fetch({email}) : null;
      if (user) {
        return user;
      }
      const userByUsername = username ? await userService.fetch({username}) : null;
      if (userByUsername) {
        return userByUsername
      }
      if (email && settings.createUserIfNotExists) {
        return this.createUser({email, username})
      }
      return false;
    },

    async sendLoginLink(token) {
      const settings = await this.settings();
      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: {email: token.email}
      });
      const userSchema = strapi.getModel('plugin::users-permissions.user');
      // Sanitize the template's user information
      const sanitizedUserInfo = await sanitize.sanitizers.defaultSanitizeOutput(userSchema, user);

      const text = await this.template(settings.message_text, {
        URL: settings.confirmationUrl,
        CODE: token.body,
        USER: sanitizedUserInfo
      });

      const html = await this.template(settings.message_html, {
        URL: settings.confirmationUrl,
        CODE: token.body,
        USER: sanitizedUserInfo
      });

      const subject = await this.template(settings.object, {
        URL: settings.confirmationUrl,
        CODE: token.body,
        USER: sanitizedUserInfo
      });

      const sendData = {
        to: token.email,
        from:
          settings.from_email && settings.from_name
            ? `${settings.from_name} <${settings.from_email}>`
            : undefined,
        replyTo: settings.response_email,
        subject,
        text,
        html,
      }
      // Send an email to the user.
      return await strapi
        .plugin('email')
        .service('email')
        .send(sendData);
    },

    async createToken(email, context) {
      const tokensService = strapi.query('plugin::passwordless.token');
      tokensService.update({where: {email}, data: {is_active: false}});
      const body = crypto.randomBytes(20).toString('hex');
      const tokenInfo = {
        email,
        body,
        context: JSON.stringify(context)
      };
      return tokensService.create({data: tokenInfo});
    },

    updateTokenOnLogin(token) {
      const tokensService = strapi.query('plugin::passwordless.token');
      return tokensService.update({where: {id: token.id}, data: {is_active: false, login_date: new Date()}});
    },

    async isTokenValid(token) {
      const settings = await this.settings();
      const tokenDate = new Date(token.createdAt).getTime() / 1000;
      const nowDate = new Date().getTime() / 1000;
      return nowDate - tokenDate <= settings.expire_period;
    },

    async deactivateToken(token) {
      const tokensService = strapi.query('plugin::passwordless.token');
      await tokensService.update(
        {where: {id: token.id}, data: {is_active: false}}
      );
    },

    fetchToken(body) {
      const tokensService = strapi.query('plugin::passwordless.token');
      return tokensService.findOne({where: {body}});
    },

    template(layout, data) {
      const compiledObject = _.template(layout);
      return compiledObject(data);
    }
  };
};
