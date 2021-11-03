const express = require("express");
const { Op } = require("sequelize");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { Message } = require("./models/Message");
const { Room } = require("./models/Room");
const { User } = require("./models/User");
const { sequelize } = require("./utils/db");
const registerRoomHandlers = require("./handlers/rooms");
const registerMessagesHandlers = require("./handlers/messages");
const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Model Associations
User.hasMany(Room, { foreignKey: "ownerId" });
Room.belongsTo(User, { foreignKey: "ownerId" });

Room.hasMany(Message, { foreignKey: "roomId" });
Message.belongsTo(Room, { foreignKey: "roomId" });

User.hasMany(Message, { foreignKey: "senderId" });
Message.belongsTo(User, { foreignKey: "senderId" });

app.post("/signup", async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ data: { user } });
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({ where: { ...req.body } });
  res.status(200).json({ data: { user } });
});

app.get("/rooms", async (req, res) => {
  const rooms = await Room.findAll({
    where: {
      [Op.or]: [{ ownerId: req.query.ownerId }, { userId: req.query.ownerId }],
    },
    include: {
      model: Message,
      // Works fine! but very bad approach!!!
      // TODO: Refactor
      limit: 1,
      order: [["createdAt", "DESC"]],
    },
  });
  res.status(200).json({ data: { rooms } });
});

const allowedOrigins = "*"

sequelize.sync({ alter: false }).then(() => {
  const httpServer = createServer(app);
  const io = new Server(httpServer, { cors: allowedOrigins });


  // TODO: Move to redis
  const onlineUserIds = new Set();
  const onlineUsers = {};

  const createUser = (socket) => {
    const id = socket.handshake.query.id;
    const user = { id, name: socket.handshake.query.name, socketId: socket.id };
    onlineUsers[id] = user;
    return user;
  };

  const onConnection = (socket) => {
    // Store incoming users in a set.
    onlineUserIds.add(socket.handshake.query.id);

    // Update in-memory users list
    createUser(socket);

    // Emit connected clients count
    io.emit("total-online-users", onlineUserIds.size);
    
    // Emit list of connected clients
    io.emit("online-users", Object.values(onlineUsers));

    // Register handlers here
    registerRoomHandlers(io, socket, { onlineUsers });
    registerMessagesHandlers(io, socket, { onlineUsers });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      const user = Object.values(onlineUsers).find(
        (u) => u.socketId === socket.id
      );

      // Delete disconnected user! 
      // But we should change the status e.g. 1/2 for online/offline.
      delete onlineUsers[user.id];
      onlineUserIds.delete(user.id);

      // Emit connected clients count
      io.emit("total-online-users", onlineUserIds.size);

      // Emit list of connected clients
      io.emit("online-users", Object.values(onlineUsers));
    });
  };

  io.on("connection", onConnection);

  httpServer.listen(3000, () => {
    console.log('Server booted on 3000')
  });
});
