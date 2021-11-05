const { nanoid } = require("nanoid");
const { Message } = require("../models/Message");
const { Room } = require("../models/Room");

module.exports = (io, socket, extra = {}) => {
  const { onlineUsers } = extra;

  socket.on("create-chat-room", async (payload) => {
    const { content, senderId, receiverId } = payload;

    // Create the room document
    const room = new Room({ senderId, receiverId, id: nanoid() });

    // Create the message document
    const message = new Message({ senderId, content, roomId: room.id });

    // Add the message in the created room
    room.messages.push(message);

    // Save the room document with message
    const createdRoom = await room.save();

    // Create a socket room add the created room id
    socket.join(createdRoom.id);

    // Notify receiver
    if (onlineUsers[receiverId]) {
      io.to(onlineUsers[receiverId].socketId).emit(
        "new-chat-room",
        createdRoom
      );
    }

    // Notify sender
    socket.emit("create-chat-room", { room: createdRoom });
  });

  socket.on("join-chat-room", async (roomId) => {
    // Create a socket room add the created room id
    socket.join(roomId);

    // Find the room details using the roomId
    const room = await Room.findOne({ id: roomId });

    // Notify sender
    socket.emit("join-chat-room", room);
  });
};
