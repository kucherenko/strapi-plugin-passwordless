'use strict';

/**
 * passwordless.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const _ = require("lodash");
const crypto = require("crypto");
const {sanitize} = require('@strapi/utils');
const {nanoid} = require("nanoid");

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
        .findOne({
          where: {type: userSettings.default_role}
        });

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
      const user = email ? await this.fetchUser({email}) : null;
      if (user) {
        return user;
      }
      const userByUsername = username ? await this.fetchUser({username}) : null;
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
      const user = await this.fetchUser({email: token.email})

      const text = await this.template(settings.message_text, {
        URL: settings.confirmationUrl,
        CODE: token.body,
        USER: user
      });

      const html = await this.template(settings.message_html, {
        URL: settings.confirmationUrl,
        CODE: token.body,
        USER: user
      });

      const subject = await this.template(settings.object, {
        URL: settings.confirmationUrl,
        CODE: token.body,
        USER: user
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
      const settings = await this.settings();
      const {token_length = 20, stays_valid = false} = settings;
      await strapi.query('plugin::passwordless.token').update({where: {email}, data: {is_active: false}});
      const body = nanoid(token_length);
      const tokenInfo = {
        email,
        body,
        stays_valid,
        context: JSON.stringify(context)
      };
      return strapi.query('plugin::passwordless.token').create({data: tokenInfo});
    },

    updateTokenOnLogin(token) {
      const tokensService = strapi.query('plugin::passwordless.token');
      return tokensService.update({where: {id: token.id}, data: {is_active: Boolean(token.stays_valid), login_date: new Date()}});
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

    async fetchUser(data) {
      const userSchema = strapi.getModel('plugin::users-permissions.user');
      const user = await strapi.query('plugin::users-permissions.user').findOne({where: data, populate: ['role']})
      if (!user) {
        return user;
      }
      let sanitizedUser = await sanitize.sanitizers.defaultSanitizeOutput(userSchema, user);
      if(!sanitizedUser.email && user.email){
        sanitizedUser.email = user.email
      }
      return sanitizedUser
    },

    template(layout, data) {
      const compiledObject = _.template(layout);
      return compiledObject(data);
    }
  };
};
