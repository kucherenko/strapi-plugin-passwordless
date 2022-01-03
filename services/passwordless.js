'use strict';

/**
 * passwordless.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const _ = require("lodash");
const crypto = require('crypto');

const {getAbsoluteServerUrl} = require('strapi-utils');

module.exports = {

  settings() {
    const pluginStore = strapi.store({
      environment: '',
      type: 'plugin',
      name: 'passwordless',
    });
    return pluginStore.get({key: 'settings'});
  },

  async isEnabled() {
    const settings = await this.settings();
    return !!settings.enabled;
  },

  async user(email) {
    const settings = await this.settings();
    const {user: userService} = strapi.plugins['users-permissions'].services;
    const user = await userService.fetch({email});

    if (!user && settings.createUserIfNotExists) {

      const role = await strapi
        .query('role', 'users-permissions')
        .findOne({ type: settings.default_role }, []);

      if (!role) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.role.notFound',
            message: 'Impossible to find the default role.',
          })
        );
      }

      console.log(role);

      return strapi.query('user', 'users-permissions').create({
        email,
        username: email,
        role: {id: "1"}
      });
    }
    return user;
  },

  async sendLoginLink(token) {
    const settings = await this.settings();

    const text = await this.template(settings.message_text, {
      URL: `${getAbsoluteServerUrl(strapi.config)}/passwordless/login`,
      CODE: token.body,
    });
    const html = await this.template(settings.message_html, {
      URL: `${getAbsoluteServerUrl(strapi.config)}/passwordless/login`,
      CODE: token.body,
    });

    // Send an email to the user.
    return strapi.plugins['email'].services.email.send({
      to: token.email,
      from:
        settings.from_email && settings.from_name
          ? `${settings.from_name} <${settings.from_email}>`
          : undefined,
      replyTo: settings.response_email,
      subject: settings.object,
      text,
      html,
    });
  },

  async createToken(email) {
    const tokensService = strapi.query('tokens', 'passwordless');
    const oldTokens = await tokensService.find({email});
    await Promise.all(oldTokens.map((token) => {
      return tokensService.update({id: token.id}, {is_active: false});
    }));
    const body = crypto.randomBytes(20).toString('hex');
    const tokenInfo = {
      email,
      body,
      create_date: new Date()
    };
    return tokensService.create(tokenInfo);
  },

  updateTokenOnLogin(token) {
    const tokensService = strapi.query('tokens', 'passwordless');
    return tokensService.update({id: token.id}, {is_active: false, login_date: new Date()});
  },

  async isTokenValid(token) {
    if (!token || !token.is_active) {
      return false;
    }
    const settings = await this.settings();
    const tokensService = strapi.query('tokens', 'passwordless');

    const tokenDate = new Date(token.created_at).getTime() / 1000;
    const nowDate = new Date().getTime() / 1000;

    const isValidDate = nowDate - tokenDate <= settings.expire_period;
    if (!isValidDate) {
      await tokensService.update({id: token.id}, {is_active: false});
    }
    return isValidDate;
  },

  fetchToken(body) {
    const tokensService = strapi.query('tokens', 'passwordless');
    return tokensService.findOne({body});
  },

  template(layout, data) {
    const compiledObject = _.template(layout);
    return compiledObject(data);
  },
};
