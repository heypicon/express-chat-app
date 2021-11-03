const { Message } = require("../models/Message");
const { Room } = require("../models/Room");

module.exports = (io, socket, { onlineUsers }) => {
  const pushMessageToRoom = async (payload) => {
    const { roomId, content, senderId } = payload;

    // Add message in the given room
    const message = await Message.create({ roomId, senderId, content });

    // Emit the message to all clients in the given room
    io.sockets.to(roomId).emit("add-message", message);

    // Find the selected room details!
    const room = await Room.findOne({ where: { id: roomId } });

    // Check all the connected sockets in the given room
    const clientsInRoom = io.sockets.adapter.rooms.get(roomId);

    // I'm sending this msg to other person
    if (room.ownerId === senderId) {
      const receiver = Object.values(onlineUsers).find(
        (user) => user.id === room.userId
      );
      // If the receiver is online but not in my chat room then emit unread-message event.
      // Client will use this event to update last message in the sidebar
      if (receiver && !clientsInRoom.has(receiver.socketId)) {
        io.to(receiver.socketId).emit("unread-message", message);
      }
    }
  };

  const getMessagesWithFilters = async (roomId) => {
    const messages = await Message.findAll({
      where: { roomId: roomId },
      order: [["createdAt", "ASC"]],
      limit: 20,
    });
    socket.emit("get-messages", messages);
  };

  const deleteRoomMessage = async ({ roomId, messageId }) => {
    const deleteCount = await Message.destroy({
      where: { roomId, id: messageId },
    });

    // Notify the room about message delete event!
    // Client side will use this messageId to find deleted message then remove it from the messages list!
    io.sockets
      .to(roomId)
      .emit("delete-room-message", { messageId, deleteCount });
  };

  socket.on("add-message", pushMessageToRoom);
  socket.on("get-messages", getMessagesWithFilters);
  socket.on("delete-room-message", deleteRoomMessage);
};
