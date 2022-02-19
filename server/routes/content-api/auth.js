module.exports = [
  {
    method: 'GET',
    path: '/login',
    handler: 'auth.login',
    config: {
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/send-link',
    handler: 'auth.sendLink',
    config: {
      auth: false
    }
  }
]