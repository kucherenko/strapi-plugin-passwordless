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

    async user(email) {
      const settings = await this.settings();
      const userSettings = await this.userSettings();
      const {user: userService} = strapi.plugins['users-permissions'].services;
      const user = await userService.fetch({email});

      if (!user && settings.createUserIfNotExists) {
        const role = await strapi
          .query('plugin::users-permissions.role')
          .findOne({type: userSettings.default_role}, []);

        if (!role) {
          return ctx.badRequest(
            null,
            {
              id: 'Auth.form.error.role.notFound',
              message: 'Impossible to find the default role.',
            }
          );
        }
        const newUser = {
          email,
          username: email,
          role: {id: role.id}
        };
        return strapi
          .query('plugin::users-permissions.user')
          .create({data: newUser, populate: ['role']});
      }
      return user;
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

    async createToken(email) {
      const tokensService = strapi.query('plugin::passwordless.token');
      tokensService.update({where: {email}, data: {is_active: false}});
      const body = crypto.randomBytes(20).toString('hex');
      const tokenInfo = {
        email,
        body,
      };
      return tokensService.create({data: tokenInfo});
    },

    updateTokenOnLogin(token) {
      const tokensService = strapi.query('plugin::passwordless.token');
      return tokensService.update({where: {id: token.id}, data: {is_active: false, login_date: new Date()}});
    },

    async isTokenValid(token) {
      if (!token || !token.is_active) {
        return false;
      }
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
