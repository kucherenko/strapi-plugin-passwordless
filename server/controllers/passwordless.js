'use strict';

/**
 * passwordless.js controller
 *
 * @description: A set of functions called "actions" of the `passwordless` plugin.
 */

const _ = require("lodash");
module.exports = {

  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {
    // Add your own logic here.

    // Send 200 `ok`
    ctx.send({
      message: 'ok'
    });
  },

  async getSettings(ctx) {
    ctx.send({
      settings: await strapi
        .store({
          environment: '',
          type: 'plugin',
          name: 'passwordless',
          key: 'settings',
        })
        .get(),
    });
  },

  async updateSettings(ctx) {
    if (_.isEmpty(ctx.request.body)) {
      return ctx.badRequest(null, [{ messages: [{ id: 'Cannot be empty' }] }]);
    }

    await strapi
      .store({
        environment: '',
        type: 'plugin',
        name: 'passwordless',
        key: 'settings',
      })
      .set({ value: ctx.request.body });

    ctx.send({ ok: true });
  },
};
