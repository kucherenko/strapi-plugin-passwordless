const pluginPermissions = {
  // Settings
  readSettings: [
    { action: 'plugins::passwordless.settings.read', subject: null },
  ],
  updateSettings: [
    { action: 'plugins::passwordless.settings.update', subject: null },
  ],
};