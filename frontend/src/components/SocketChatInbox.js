"use client";

import { useEffect, useMemo, useState } from "react";
import { useRealtime } from "@/context/RealtimeContext";

function formatTime(value) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function SocketChatInbox() {
  const { currentUser, receiveMessage, sendMessage: sendRealtimeMessage } = useRealtime();
  const [conversations, setConversations] = useState({});
  const [activeId, setActiveId] = useState("");
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (currentUser?._id) return;

    setConversations({});
    setActiveId("");
    setOpen(false);
  }, [currentUser?._id]);

  useEffect(() => {
    if (!currentUser?._id) return;

    function handleMessage(message) {
      if (message.to !== currentUser._id && message.from !== currentUser._id) return;

      setConversations((prev) => {
        const previous = prev[message.conversationId] || {
          id: message.conversationId,
          productId: message.productId,
          participantId: message.from === currentUser._id ? message.to : message.from,
          participantName: message.from === currentUser._id ? "Seller" : message.fromName || "Student",
          messages: [],
          unread: 0,
        };

        if (previous.messages.some((item) => item.id === message.id)) return prev;

        return {
          ...prev,
          [message.conversationId]: {
            ...previous,
            participantId: message.from === currentUser._id ? message.to : message.from,
            participantName: message.from === currentUser._id ? previous.participantName : message.fromName || "Student",
            messages: [...previous.messages, message],
            unread:
              message.to === currentUser._id && activeId !== message.conversationId
                ? previous.unread + 1
                : previous.unread,
          },
        };
      });
    }

    return receiveMessage(handleMessage);
  }, [activeId, currentUser?._id, receiveMessage]);

  const conversationList = useMemo(
    () =>
      Object.values(conversations).sort((a, b) => {
        const aTime = new Date(a.messages.at(-1)?.createdAt || 0).getTime();
        const bTime = new Date(b.messages.at(-1)?.createdAt || 0).getTime();
        return bTime - aTime;
      }),
    [conversations]
  );

  const activeConversation = activeId ? conversations[activeId] : conversationList[0];
  const unreadCount = conversationList.reduce((sum, item) => sum + item.unread, 0);

  function openConversation(id) {
    setActiveId(id);
    setOpen(true);
    setConversations((prev) => ({
      ...prev,
      [id]: { ...prev[id], unread: 0 },
    }));
  }

  function handleSendMessage(event) {
    event.preventDefault();
    const messageText = text.trim();
    if (!messageText || !activeConversation || !currentUser?._id) return;

    sendRealtimeMessage({
      conversationId: activeConversation.id,
      productId: activeConversation.productId,
      from: currentUser._id,
      fromName: currentUser.name,
      to: activeConversation.participantId,
      text: messageText,
    });
    setText("");
  }

  if (!currentUser?._id || conversationList.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[90]">
      {!open ? (
        <button
          type="button"
          onClick={() => openConversation(conversationList[0].id)}
          className="relative rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-xl transition-colors hover:bg-indigo-700"
        >
          Messages
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-xs font-black text-slate-950">
              {unreadCount}
            </span>
          )}
        </button>
      ) : (
        <section className="flex h-[460px] w-[360px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <aside className="w-28 border-r border-slate-100 bg-slate-50">
            <div className="border-b border-slate-100 px-3 py-3 text-xs font-bold text-slate-500">
              Chats
            </div>
            <div className="max-h-[410px] overflow-y-auto">
              {conversationList.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => openConversation(conversation.id)}
                  className={`block w-full truncate px-3 py-3 text-left text-xs font-semibold ${
                    activeConversation?.id === conversation.id
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-white"
                  }`}
                >
                  {conversation.participantName}
                  {conversation.unread > 0 && (
                    <span className="ml-1 rounded-full bg-amber-400 px-1.5 text-[10px] text-slate-950">
                      {conversation.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">
                  {activeConversation?.participantName}
                </p>
                <p className="text-xs text-slate-400">Live chat</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
              >
                x
              </button>
            </header>

            <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-3">
              {activeConversation?.messages.map((message) => {
                const mine = message.from === currentUser._id;
                return (
                  <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[84%] rounded-2xl px-3 py-2 text-xs ${mine ? "bg-indigo-600 text-white" : "bg-white text-slate-800"}`}>
                      <p className="break-words">{message.text}</p>
                      <p className={`mt-1 text-[10px] ${mine ? "text-indigo-100" : "text-slate-400"}`}>
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-slate-100 p-3">
              <input
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Reply..."
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white disabled:bg-slate-300"
              >
                Send
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
