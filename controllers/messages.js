const { Message } = require("../models/Message");
const { Room } = require("../models/Room");

module.exports = (io, socket, extra = {}) => {
  const { onlineUsers } = extra;

  socket.on("get-messages", async (roomId) => {
    // Find the room details using the roomId
    // Include messages list, omit everything else!
    const room = await Room.findOne({ id: roomId }, { messages: 1, _id: 0 });
    // Notify sender
    socket.emit("get-messages", room?.messages || []);
  });

  socket.on("add-message", async (payload) => {
    const { roomId, content, url, contentType, senderId } = payload;

    // Create message document!
    const message = new Message({
      senderId,
      contentType,
      content: contentType === 1 ? content : null,
      url: contentType === 2 ? url : null,
      roomId: roomId,
    });

    // Add the message in the given room
    await Room.updateOne({ id: roomId }, { $push: { messages: message } });

    // Fetch the updated room details
    const selectedRoom = await Room.findOne({ id: roomId });

    // Find all sockets in the given room
    const clientsInRoom = io.sockets.adapter.rooms.get(roomId);

    // Find the receiver
    const receiver = Object.values(onlineUsers).find(
      (user) => user.userId === selectedRoom.receiverId
    );

    // Notify all sockets in the given room
    io.sockets.to(roomId).emit("add-message", message);

    // Notify the receiver socket if online but not in the current room!
    if (selectedRoom.senderId === senderId) {
      if (receiver && !clientsInRoom.has(receiver.socketId)) {
        io.to(receiver.socketId).emit("unread-message", message);
      }
    }
  });

  socket.on("delete-room-message", async ({ roomId, messageId }) => {
    // Find the room and delete the specified message
    const deletedAck = await Room.updateOne(
      { id: roomId },
      { $pull: { messages: { _id: messageId } } }
    );

    // Notify sender plus receiver
    io.sockets.to(roomId).emit("delete-room-message", {
      messageId,
      deleteCount: deletedAck.modifiedCount,
    });
  });
};
