module.exports = [
  {
    method: 'GET',
    path: '/login',
    handler: 'auth.login',
  },
  {
    method: 'POST',
    path: '/send-link',
    handler: 'auth.sendLink',
  }
]