const { Schema, model } = require("mongoose");

exports.MessageSchema = new Schema(
  {
    senderId: String,
    content: String,
    contentType: {
      type: Number,
      enum: [1, 2], // 1 = Text, 2 = Media
      default: 1,
    },
    url: {
      type: String,
      required: false, // nullable
    },
    roomId: String,
  },
  { timestamps: true }
);

exports.Message = model("Message", this.MessageSchema)