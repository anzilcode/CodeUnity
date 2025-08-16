// socket.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PISTON_API = process.env.PISTON_API || "https://emkc.org/api/v2/piston/execute";

export function setupSocket(io) {
  const rooms = new Map();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    let currentRoom = null;
    let currentUser = null;

    // Join Room
    socket.on("join", ({ roomId, userName }) => {
      if (currentRoom) {
        socket.leave(currentRoom);
        rooms.get(currentRoom).delete(currentUser);
        io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
      }

      currentRoom = roomId;
      currentUser = userName;

      socket.join(roomId);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }

      rooms.get(roomId).add(userName);

      io.to(roomId).emit("userJoined", Array.from(rooms.get(currentRoom)));
    });

    // Code Change
    socket.on("codeChange", ({ roomId, code }) => {
      socket.to(roomId).emit("codeUpdate", code);
    });

    // Typing
    socket.on("typing", ({ roomId, userName }) => {
      socket.to(roomId).emit("userTyping", userName);
    });

    // Language Change
    socket.on("languageChange", ({ roomId, language }) => {
      io.to(roomId).emit("languageUpdate", language);
    });

    // Compile Code
    socket.on("compileCode", async ({ code, roomId, language, version }) => {
      if (!rooms.has(roomId)) return;

      try {
        const response = await axios.post(PISTON_API, {
          language,
          version: version || "*",
          files: [{ content: code }],
        });

        io.to(roomId).emit("codeResponse", response.data);
      } catch (err) {
        console.error("Error compiling code:", err.message);
        io.to(roomId).emit("codeResponse", { run: { output: "Error compiling code" } });
      }
    });

    // Leave Room
    socket.on("leaveRoom", () => {
      if (currentRoom && currentUser) {
        rooms.get(currentRoom).delete(currentUser);
        io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
        socket.leave(currentRoom);
        currentRoom = null;
        currentUser = null;
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (currentRoom && currentUser) {
        rooms.get(currentRoom).delete(currentUser);
        io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
      }
      console.log("User disconnected:", socket.id);
    });
  });
}
