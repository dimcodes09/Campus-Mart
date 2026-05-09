"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import socket, { connectSocket, disconnectSocket } from "@/services/socket";

const RealtimeContext = createContext(null);

function getStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function RealtimeProvider({ children }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("idle");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [lastMessage, setLastMessage] = useState(null);
  const messageHandlersRef = useRef(new Set());
  const messageErrorHandlersRef = useRef(new Set());
  const joinedConversationsRef = useRef(new Map());

  const refreshCurrentUser = useCallback(() => {
    setCurrentUser(getStoredUser());
  }, []);

  useEffect(() => {
    const refreshId = window.setTimeout(refreshCurrentUser, 0);
    return () => window.clearTimeout(refreshId);
  }, [pathname, refreshCurrentUser]);

  useEffect(() => {
    window.addEventListener("focus", refreshCurrentUser);
    window.addEventListener("storage", refreshCurrentUser);
    window.addEventListener("auth-change", refreshCurrentUser);

    return () => {
      window.removeEventListener("focus", refreshCurrentUser);
      window.removeEventListener("storage", refreshCurrentUser);
      window.removeEventListener("auth-change", refreshCurrentUser);
    };
  }, [refreshCurrentUser]);

  useEffect(() => {
    const currentUserId = currentUser?._id?.toString();

    if (!currentUserId) {
      joinedConversationsRef.current.clear();
      disconnectSocket();

      const resetId = window.setTimeout(() => {
        setConnectionStatus("idle");
        setOnlineUsers([]);
      }, 0);

      return () => window.clearTimeout(resetId);
    }

    function handleConnect() {
      setConnectionStatus("connected");
      socket.emit("register", currentUserId);

      joinedConversationsRef.current.forEach((userId, conversationId) => {
        socket.emit("join_conversation", { conversationId, userId });
      });
    }

    function handleDisconnect() {
      setConnectionStatus("disconnected");
      setOnlineUsers([]);
    }

    function handleConnectError(error) {
      setConnectionStatus("error");
      console.error("[Socket] Connection error:", error.message);
    }

    function handleOnlineUsers(users = []) {
      setOnlineUsers(Array.isArray(users) ? users.map(String) : []);
    }

    function handleMessage(message) {
      setLastMessage(message);
      messageHandlersRef.current.forEach((handler) => handler(message));
    }

    function handleMessageError(error) {
      messageErrorHandlersRef.current.forEach((handler) => handler(error));
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("online_users", handleOnlineUsers);
    socket.on("receive_message", handleMessage);
    socket.on("message_error", handleMessageError);

    let connectingId;

    if (socket.connected) {
      handleConnect();
    } else {
      connectingId = window.setTimeout(() => {
        setConnectionStatus("connecting");
      }, 0);
      connectSocket();
    }

    return () => {
      if (connectingId) {
        window.clearTimeout(connectingId);
      }

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("online_users", handleOnlineUsers);
      socket.off("receive_message", handleMessage);
      socket.off("message_error", handleMessageError);
    };
  }, [currentUser?._id]);

  const joinConversation = useCallback(
    ({ conversationId, userId } = {}) => {
      if (!conversationId) return;

      const normalizedConversationId = conversationId.toString();
      const participantId = (userId || currentUser?._id)?.toString();
      joinedConversationsRef.current.set(normalizedConversationId, participantId);

      if (!socket.connected) {
        connectSocket();
      }

      socket.emit("join_conversation", {
        conversationId: normalizedConversationId,
        userId: participantId,
      });
    },
    [currentUser?._id]
  );

  const sendMessage = useCallback((payload = {}) => {
    const messageText = typeof payload.text === "string" ? payload.text.trim() : "";

    if (!payload.conversationId || !payload.from || !payload.to || !messageText) {
      return false;
    }

    if (!socket.connected) {
      connectSocket();
    }

    socket.emit("send_message", { ...payload, text: messageText });
    return true;
  }, []);

  const receiveMessage = useCallback((handler) => {
    if (typeof handler !== "function") return () => {};

    messageHandlersRef.current.add(handler);
    return () => messageHandlersRef.current.delete(handler);
  }, []);

  const receiveMessageError = useCallback((handler) => {
    if (typeof handler !== "function") return () => {};

    messageErrorHandlersRef.current.add(handler);
    return () => messageErrorHandlersRef.current.delete(handler);
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      connectionStatus,
      onlineUsers,
      lastMessage,
      sendMessage,
      receiveMessage,
      receiveMessageError,
      joinConversation,
    }),
    [
      currentUser,
      connectionStatus,
      onlineUsers,
      lastMessage,
      sendMessage,
      receiveMessage,
      receiveMessageError,
      joinConversation,
    ]
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error("useRealtime must be used inside RealtimeProvider");
  return ctx;
}
