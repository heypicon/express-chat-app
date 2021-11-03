const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/db");

exports.Room = sequelize.define("Room", {
  id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  // MAJOR: Refactor these two.  Possibily fromId/senderId , toId, receiverId
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});
