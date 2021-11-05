exports.env = {
  // Database
  MYSQL_USER: process.env.MYSQL_USER,
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
  MYSQL_DB: process.env.MYSQL_DB,
  MYSQL_HOST: process.env.MYSQL_HOST,
  MYSQL_PORT: process.env.MYSQL_PORT,
  MYSQL_POOL_SIZE: process.env.MYSQL_POOL_SIZE,

  MONGO_HOST: process.env.MONGO_HOST,
  MONGO_PORT: process.env.MONGO_PORT,
  MONGO_DATABASE: process.env.MONGO_DATABASE,
  
  // Encryption
  MESSAGE_ENCRYPTION_KEY: process.env.MESSAGE_ENCRYPTION_KEY,

  // CORS
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,

  // App
  PORT: process.env.PORT
};
