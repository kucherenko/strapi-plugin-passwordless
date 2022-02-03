module.exports = [
  {
    method: 'GET',
    path: '/passwordless/login',
    handler: 'auth.login',
  },
  {
    method: 'POST',
    path: '/passwordless/send-link',
    handler: 'auth.sendLink',
  }
]