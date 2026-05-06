module.exports = {
  db: {
    host:     process.env.DB_HOST || 'localhost',
    port:     process.env.DB_PORT || 3306,
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Ezar#0000#',
    database: process.env.DB_NAME || 'desa_cikulak',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
  },
  jwt: {
    secret:    process.env.JWT_SECRET || 'desa_cikulak_jwt_secret_2025',
    expiresIn: '8h',
  },
  server: {
    port: process.env.PORT || 5000,
  },
};