const pluginPermissions = {
  main: [
    {action: 'plugin::passwordless.main', subject: null}
  ],
  readSettings: [
    {action: 'plugin::passwordless.settings.read', subject: null},
  ],
  updateSettings: [
    {action: 'plugin::passwordless.settings.update', subject: null},
  ],

};

export default pluginPermissions;