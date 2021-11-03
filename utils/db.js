const { Sequelize } = require("sequelize");

exports.sequelize = new Sequelize("db", "user", "password", {
  dialect: "mysql",
  logging: false,
  pool: {
    max: 120
  }
});
