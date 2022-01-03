'use strict';
/**
 * Auth.js controller
 *
 * @description: A set of functions called "actions" for managing `Auth`.
 */
/* eslint-disable no-useless-escape */
const _ = require('lodash');
const {sanitizeEntity} = require('strapi-utils');
const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports = {
  async login(ctx) {
    const {loginToken} = ctx.query;
    const {passwordless} = strapi.plugins['passwordless'].services;
    const {user: userService, jwt: jwtService} = strapi.plugins['users-permissions'].services;
    const isEnabled = await passwordless.isEnabled();

    if (!isEnabled) {
      return ctx.badRequest('plugin.disabled');
    }

    if (_.isEmpty(loginToken)) {
      return ctx.badRequest('token.invalid');
    }

    const token = await passwordless.fetchToken(loginToken);

    const isValid = await passwordless.isTokenValid(token);

    if (!isValid) {
      return ctx.badRequest('token.invalid');
    }

    await passwordless.updateTokenOnLogin(token);

    const user = await userService.fetch({email: token.email});

    if (!user) {
      return ctx.badRequest('wrong.email');
    }

    if (user.blocked) {
      return ctx.badRequest('blocked.user');
    }

    if (!user.confirmed) {
      await userService.edit({id: user.id}, {confirmed: true});
    }

    ctx.send({
      jwt: jwtService.issue({id: user.id}),
      user: sanitizeEntity(user, {
        model: strapi.query('user', 'users-permissions').model,
      }),
    });
  },

  async sendLink(ctx) {
    const {passwordless} = strapi.plugins['passwordless'].services;

    const isEnabled = await passwordless.isEnabled();

    if (!isEnabled) {
      return ctx.badRequest('plugin.disabled');
    }

    const params = _.assign(ctx.request.body);

    if (!params.email) {
      return ctx.badRequest('missing.email');
    }

    const email = params.email.trim().toLowerCase();

    const isEmail = emailRegExp.test(email);

    if (!isEmail) {
      return ctx.badRequest('wrong.email');
    }

    const user = passwordless.user(email);

    if (!user) {
      return ctx.badRequest('wrong.email');
    }

    if (user.blocked) {
      return ctx.badRequest('blocked.user');
    }

    try {
      const token = await passwordless.createToken(email);
      await passwordless.sendLoginLink(token);
      ctx.send({
        email,
        sent: true,
      });
    } catch (err) {
      return ctx.badRequest(null, err);
    }
  },

};