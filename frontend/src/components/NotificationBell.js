"use client";

import { useEffect, useRef, useState } from "react";
import { useNotifications } from "@/context/NotificationContext";

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TYPE_STYLES = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleOpen() {
    setOpen((prev) => !prev);
    if (!open && unreadCount > 0) {
      setTimeout(() => markAllRead(), 800);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        title="Notifications"
        className={`relative flex h-9 w-10 items-center justify-center rounded-lg border text-slate-600 transition-colors ${
          open
            ? "border-indigo-200 bg-indigo-50 text-indigo-700"
            : "border-transparent hover:bg-slate-50 hover:text-indigo-600"
        }`}
      >
        <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold leading-none text-slate-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-[999] w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-slate-900">Notifications</p>
            </div>

            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-medium text-slate-500">No notifications yet</p>
                <p className="mt-1 text-xs text-slate-400">
                  Activity updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b px-4 py-3 ${
                    notification.read ? "border-slate-100 bg-white" : "border-slate-100 bg-indigo-50/40"
                  }`}
                >
                  <div
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      TYPE_STYLES[notification.type] || TYPE_STYLES.info
                    }`}
                  >
                    <p className="font-medium leading-5">{notification.text}</p>
                    <p className="mt-1 text-xs opacity-70">{timeAgo(notification.time)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
