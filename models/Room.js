const { Schema, model } = require("mongoose");
const { MessageSchema } = require("./Message");

const RoomSchema = new Schema(
    {
      id: String,
      senderId: String,
      receiverId: String,
      messages: [MessageSchema],
    },
    { timestamps: true }
  );
  
  exports.Room = model("Room", RoomSchema);