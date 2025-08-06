import { Server } from "socket.io";

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Replace with frontend URL in production
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  const connectedUsers = new Map();

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("setup", (userData) => {
      if (!userData?._id) return;
      
      // Store user connection
      connectedUsers.set(userData._id, socket.id);
      socket.userId = userData._id;
      
      // Join user's personal room
      socket.join(userData._id);
      socket.emit("connected");
    });

    socket.on("join_chat", (chatId) => {
      if (!chatId) return;
      console.log("👥 User", socket.userId, "joined chat:", chatId);
      socket.join(chatId);
    });

    socket.on("leave_chat", (chatId) => {
      if (!chatId) return;
      console.log("User left chat:", chatId);
      socket.leave(chatId);
    });

    socket.on("typing", (chatId) => {
      if (!chatId) return;
      socket.to(chatId).emit("typing", socket.userId);
    });

    socket.on("stop_typing", (chatId) => {
      if (!chatId) return;
      socket.to(chatId).emit("stop_typing", socket.userId);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
      
      // Remove user from connected users
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
      }
    });
  });

  return io;
};
