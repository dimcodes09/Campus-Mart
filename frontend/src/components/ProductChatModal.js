"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRealtime } from "@/context/RealtimeContext";

function getConversationId(productId, userA, userB) {
  return [productId, ...[userA, userB].map(String).sort()].join(":");
}

function formatTime(value) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ProductChatModal({ product, currentUser, onClose }) {
  const {
    connectionStatus,
    joinConversation,
    receiveMessage,
    receiveMessageError,
    sendMessage: sendRealtimeMessage,
  } = useRealtime();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const listRef = useRef(null);
  const status = connectionStatus === "idle" ? "connecting" : connectionStatus;

  const ownerId = product?.owner?._id || product?.owner;
  const conversationId = useMemo(() => {
    if (!product?._id || !currentUser?._id || !ownerId) return "";
    return getConversationId(product._id, currentUser._id, ownerId);
  }, [currentUser?._id, ownerId, product?._id]);

  useEffect(() => {
    if (!conversationId || !currentUser?._id) return;

    joinConversation({
      conversationId,
      userId: currentUser._id,
    });

    function handleMessage(message) {
      if (message.conversationId !== conversationId) return;
      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev;
        return [...prev, message];
      });
    }

    function handleError(error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          from: "system",
          text: error?.message || "Message failed.",
          createdAt: new Date().toISOString(),
          system: true,
        },
      ]);
    }

    const unsubscribeMessage = receiveMessage(handleMessage);
    const unsubscribeError = receiveMessageError(handleError);

    return () => {
      unsubscribeMessage();
      unsubscribeError();
    };
  }, [conversationId, currentUser?._id, joinConversation, receiveMessage, receiveMessageError]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function sendMessage(event) {
    event.preventDefault();
    const messageText = text.trim();
    if (!messageText || !conversationId || !currentUser?._id || !ownerId) return;

    sendRealtimeMessage({
      conversationId,
      productId: product._id,
      from: currentUser._id,
      fromName: currentUser.name,
      to: ownerId,
      text: messageText,
    });
    setText("");
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close chat"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      <section className="relative z-[111] flex h-[min(620px,86vh)] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <header className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                Chat with seller
              </p>
              <h2 className="truncate text-lg font-bold text-slate-950">{product?.title}</h2>
              <p className="mt-1 text-xs text-slate-500">
                Socket {status}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
              aria-label="Close"
            >
              x
            </button>
          </div>
        </header>

        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center">
              <p className="text-sm font-semibold text-slate-700">No messages yet</p>
              <p className="mt-1 text-xs text-slate-400">
                Send a message while the seller is online to test real-time chat.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const mine = message.from === currentUser?._id;
              return (
                <div
                  key={message.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                      message.system
                        ? "bg-red-50 text-red-700"
                        : mine
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-slate-800"
                    }`}
                  >
                    {!mine && !message.system && (
                      <p className="mb-1 text-[11px] font-semibold text-slate-400">
                        {message.fromName || "Seller"}
                      </p>
                    )}
                    <p className="break-words leading-5">{message.text}</p>
                    <p className={`mt-1 text-[10px] ${mine ? "text-indigo-100" : "text-slate-400"}`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-100 bg-white p-4">
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Type a message..."
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-indigo-300"
          />
          <button
            type="submit"
            disabled={!text.trim() || status !== "connected"}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Send
          </button>
        </form>
      </section>
    </div>
  );
}
