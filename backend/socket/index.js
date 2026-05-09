const connectedUsers = {};

let ioInstance = null;

const emitOnlineUsers = () => {
  if (!ioInstance) return;
  ioInstance.emit("online_users", Object.keys(connectedUsers));
};

const initSocket = (server) => {
  const { Server } = require("socket.io");
  const clientOrigins = (process.env.CLIENT_URL || "http://localhost:3000,http://localhost:3001")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  ioInstance = new Server(server, {
    cors: {
      origin(origin, callback) {
        if (!origin || clientOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} is not allowed by Socket.IO CORS.`));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  ioInstance.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on("register", (userId) => {
      registerUserSocket(socket, userId);
    });

    socket.on("join_conversation", ({ conversationId, userId } = {}) => {
      if (!conversationId) return;

      registerUserSocket(socket, userId);
      socket.join(conversationId);
      socket.emit("chat_joined", { conversationId });
      console.log(`[Socket] ${socket.id} joined conversation ${conversationId}`);
    });

    socket.on("send_message", (payload = {}) => {
      const { conversationId, productId, from, fromName, to, text } = payload;
      const messageText = typeof text === "string" ? text.trim() : "";

      if (!conversationId || !from || !to || !messageText) {
        socket.emit("message_error", { message: "Invalid chat message." });
        return;
      }

      const message = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        conversationId,
        productId,
        from: from.toString(),
        fromName: fromName || "Student",
        to: to.toString(),
        text: messageText,
        createdAt: new Date().toISOString(),
      };

      socket.join(conversationId);
      ioInstance.to(conversationId).emit("receive_message", message);

      const recipientSocketId = connectedUsers[message.to];
      if (recipientSocketId) {
        ioInstance.to(recipientSocketId).emit("receive_message", message);
      }

      console.log(`[Socket] Message ${message.from} -> ${message.to} in ${conversationId}`);
    });

    socket.on("disconnect", () => {
      const userId = socket.data.userId;
      if (userId && connectedUsers[userId] === socket.id) {
        delete connectedUsers[userId];
        emitOnlineUsers();
        console.log(`[Socket] User ${userId} disconnected`);
      }
    });
  });

  return ioInstance;
};

const registerUserSocket = (socket, userId) => {
  if (!userId) return;

  const normalizedUserId = userId.toString();
  connectedUsers[normalizedUserId] = socket.id;
  socket.data.userId = normalizedUserId;
  emitOnlineUsers();
  console.log(`[Socket] Registered user ${normalizedUserId} -> ${socket.id}`);
};

const emitToUser = (userId, event, payload) => {
  const socketId = connectedUsers[userId?.toString()];
  if (socketId && ioInstance) {
    ioInstance.to(socketId).emit(event, payload);
    return true;
  }

  return false;
};

const getIO = () => ioInstance;

module.exports = { initSocket, emitToUser, getIO };
