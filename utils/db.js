const { Sequelize } = require("sequelize");
const { env } = require("../config/env");

exports.sequelize = new Sequelize(
  env.MYSQL_DB,
  env.MYSQL_USER,
  env.MYSQL_PASSWORD,
  {
    dialect: "mysql",
    logging: false,
    pool: {
      max: env.MYSQL_POOL_SIZE ? Number(env.MYSQL_POOL_SIZE) : 120,
    },
  }
);
