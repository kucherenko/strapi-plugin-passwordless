'use strict';

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 */

const usersPermissionsActions = require('../users-permissions-actions');

module.exports = async () => {
  const pluginStore = strapi.store({
    environment: '',
    type: 'plugin',
    name: 'passwordless',
  });

  if (!(await pluginStore.get({key: 'settings'}))) {
    const value = {
      enabled: true,
      createUserIfNotExists: true,
      expire_period: 3600,
      from_name: 'Administration Panel',
      from_email: 'no-reply@strapi.io',
      response_email: '',
      object: 'Passwordless Login',
      message_html: `<p>Hi!</p>
<p>Please click on the link below to login on the site.</p>
<p><%= URL %>?loginToken=<%= CODE %></p>
<p>Thanks.</p>`,
      message_text: `Hi!
Please click on the link below to login on the site.
<%= URL %>?loginToken=<%= CODE %>
Thanks.`,
    };

    await pluginStore.set({key: 'settings', value});
  }

  await strapi.admin.services.permission.actionProvider.registerMany(
    usersPermissionsActions.actions
  );
};
