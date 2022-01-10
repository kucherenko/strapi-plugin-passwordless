module.exports = [
  {
    method: 'GET',
    path: '/passwordless/login',
    handler: 'auth.login',
    config: {
      policies: [],
    }
  },
  {
    method: 'POST',
    path: '/passwordless/send-link',
    handler: 'auth.sendLink',
    config: {
      policies: [],
    }
  }
]