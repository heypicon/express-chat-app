require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { connect } = require("mongoose");
const { Room } = require("./models/Room");
const { env } = require("./config/env");
const roomsHandler = require("./controllers/rooms");
const messagesHandler = require("./controllers/rooms");

const { MONGO_HOST, MONGO_PORT, MONGO_DATABASE } = env;

connect(`mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}`)
  .then(() => {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.get("/rooms/:userId", async (req, res) => {
      const rooms = await Room.find({
        $or: [
          { senderId: req.params.userId },
          { receiverId: req.params.userId },
        ],
      });
      res.status(200).json({ rooms });
    });

    const httpServer = createServer(app);
    const io = new Server(httpServer, { cors: env.ALLOWED_ORIGINS });

    const onlineUsers = {};

    const createUser = (socket) => {
      const userId = socket.handshake.query.userId;
      const user = {
        userId,
        name: socket.handshake.query.name,
        socketId: socket.id,
      };
      onlineUsers[userId] = user;
      return user;
    };

    const onConnection = (socket) => {
      // Store the current in memory!
      createUser(socket);

      // Send connected users to client side
      io.emit("online-users", Object.values(onlineUsers));

      roomsHandler(io, socket, { onlineUsers });
      messagesHandler(io, socket, { onlineUsers });

      socket.on("disconnect", (reason) => {});
    };

    io.on("connection", onConnection);

    httpServer.listen(env.PORT, () => {
      console.log("Server booted on " + env.PORT);
    });
  })
  .catch((error) => console.log(error.message));
