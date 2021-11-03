const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/db");

exports.Message = sequelize.define("Message", {
  id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  content: DataTypes.STRING(100),
  senderId: {
    // No need to store receiverId/toUserId. 
    // Frontend can simply check whether authenticated client id matches with senderId or not!
    // If matches align to right otherwise keep left aligned.
    type: DataTypes.UUID,
    allowNull: false,
  },
  roomId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});
