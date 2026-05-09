// src/services/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1500,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 3,
  timeout: 4000,
  transports: ["websocket"],
  withCredentials: true,
});

export function connectSocket() {
  if (!socket.connected && !socket.active) {
    socket.connect();
  }

  return socket;
}

export function disconnectSocket() {
  if (socket.connected || socket.active) {
    socket.disconnect();
  }
}

export default socket;
