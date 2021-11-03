const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/db");
const aes256 = require("aes256");

exports.Message = sequelize.define("Message", {
  id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  content: {
    type: DataTypes.TEXT,
    get() {
      if (!this.getDataValue("content")) return null;
      return aes256.decrypt("secret", this.getDataValue("content"));
    },
  },
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
  url: {
    type: DataTypes.BLOB("long"),
    get() {
      // Convert blog to base64 string. 
      // This is temporary. We will move to S3 later on!
      if (!this.getDataValue("url")) return null;
      return this.getDataValue("url").toString("utf8");
    },
  },
  contentType: {
    // Use enum. Too lazy here! :D
    type: DataTypes.STRING,
    defaultValue: 1,
  },
});
