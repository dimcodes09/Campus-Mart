"use client";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { getVerifications } from "@/services/api";
import VerificationCard from "@/components/VerificationCard";

const AUTH_CHANGE_EVENT = "auth-change";

function getStoredUser() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("user") || "";
}

function subscribeToAuthChanges(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
  };
}

function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all animate-slide-in ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-500"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

function AdminNavbar({ count }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <span className="font-bold text-slate-800 text-lg">CampusMart</span>
          <span className="text-slate-300 mx-1">|</span>
          <span className="text-slate-500 text-sm">Admin Panel</span>
        </div>
        {count > 0 && (
          <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
            {count} Pending
          </span>
        )}
      </div>
    </header>
  );
}

export default function AdminPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const userSnapshot = useSyncExternalStore(
    subscribeToAuthChanges,
    getStoredUser,
    () => ""
  );
  const user = useMemo(() => {
    if (!userSnapshot) return null;

    try {
      return JSON.parse(userSnapshot);
    } catch {
      return null;
    }
  }, [userSnapshot]);
  const isAdmin = user?.role === "admin";

  const pushToast = useCallback((message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 3000);
  }, []);

  useEffect(() => {
    if (!isAdmin) return undefined;

    let cancelled = false;
    Promise.resolve().then(async () => {
      if (cancelled) return;
      setLoading(true);

      try {
        const { data } = await getVerifications();
        if (!cancelled) {
          setRequests(Array.isArray(data) ? data : data.verifications || []);
        }
      } catch (error) {
        if (!cancelled) {
          pushToast(error.response?.data?.message || "Failed to load verification requests", "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isAdmin, pushToast]);

  const handleAction = (userId, type, status) => {
    if (status === "success") {
      setRequests((prev) => prev.filter((request) => request._id !== userId));
      pushToast(
        type === "approve" ? "Student verified" : "Request rejected",
        type === "approve" ? "success" : "error"
      );
      return;
    }

    pushToast("Action failed. Try again.", "error");
  };

  if (!isAdmin) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Admin access required</h1>
        <p className="text-slate-500 text-sm max-w-md">
          Sign in with an account whose role is set to admin before reviewing verification requests.
        </p>
        <Link href="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Go to login
        </Link>
      </main>
    );
  }

  return (
    <>
      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slide-in 0.2s ease; }
      `}</style>

      <AdminNavbar count={requests.length} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">ID Verification Requests</h1>
          <p className="text-slate-500 text-sm mt-1">
            Review and approve student ID submissions
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
            Loading requests...
          </div>
        )}

        {!loading && requests.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <p className="text-slate-500 font-medium">All caught up!</p>
            <p className="text-slate-400 text-sm">No pending verification requests</p>
          </div>
        )}

        {!loading && requests.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {requests.map((request) => (
              <VerificationCard key={request._id} user={request} onAction={handleAction} />
            ))}
          </div>
        )}
      </main>

      <Toast toasts={toasts} />
    </>
  );
}
