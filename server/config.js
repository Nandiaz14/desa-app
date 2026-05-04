// server/config.js
module.exports = {
  db: {
    host:     'localhost',
    port:     3306,
    user:     'root',
    password: 'Ezar#0000#',
    database: 'desa_cikulak',
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
  },
  jwt: {
    secret:    'desa_cikulak_jwt_secret_2025',
    expiresIn: '8h',
  },
  server: {
    port: 5000,
  },
};