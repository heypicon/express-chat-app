const { Message } = require("../models/Message");
const { Room } = require("../models/Room");
const aes256 = require("aes256");
const { env } = require("../config/env");

module.exports = (io, socket, extra = {}) => {
  const { onlineUsers } = extra;

  const createChatRoom = async (payload) => {
    const { content, ownerId, userId } = payload;

    // Persist the room
    const room = await Room.create({ ownerId: ownerId, userId: userId });

    // Add a message in the created room
    const message = await Message.create({
      roomId: room.id,
      senderId: ownerId,
      content: aes256.encrypt(env.MESSAGE_ENCRYPTION_KEY, content),
    });

    // Add the current socket in the created room
    socket.join(room.id);

    // JSONIFY to reduce response size.
    const _room = {
      ...room.toJSON(),
      Messages: [message.toJSON()],
    };

    // Find the receiver and emit an event. Client side will use this event to update the sidebar!
    io.to(onlineUsers[userId].socketId).emit("new-chat-room", _room);

    // Notify the sender as well!
    socket.emit("create-chat-room", { room: _room, message });
  };

  const joinChatRoom = async (roomId) => {
    // Receive the roomId and add the current socket in that room!
    socket.join(roomId);
    // Find room details and emit to client side!
    const room = await Room.findOne({ where: { id: roomId } });
    socket.emit("join-chat-room", room);
  };

  socket.on("create-chat-room", createChatRoom);
  socket.on("join-chat-room", joinChatRoom);
};
