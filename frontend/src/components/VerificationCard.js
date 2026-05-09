"use client";
import { useState } from "react";
import { approveVerification, rejectVerification } from "@/services/api";

export default function VerificationCard({ user, onAction }) {
  const [loading, setLoading] = useState(null); // "approve" | "reject" | null
  const [imgOpen, setImgOpen] = useState(false);

  const handle = async (type) => {
    setLoading(type);
    try {
      type === "approve"
        ? await approveVerification(user._id)
        : await rejectVerification(user._id);
      onAction(user._id, type, "success");
    } catch {
      onAction(user._id, type, "error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      {/* Image lightbox */}
      {imgOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setImgOpen(false)}
        >
          <img
            src={user.studentIdImage}
            alt="Student ID"
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
          />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
            {user.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 truncate">{user.name}</p>
            <p className="text-sm text-slate-500 truncate">{user.email}</p>
          </div>
          <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
            Pending
          </span>
        </div>

        {/* ID Image */}
        <div
          className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-100 cursor-pointer group border border-slate-200"
          onClick={() => setImgOpen(true)}
        >
          <img
            src={user.studentIdImage}
            alt="Student ID"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/60 px-3 py-1 rounded-full transition">
              Click to enlarge
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => handle("approve")}
            disabled={!!loading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-xl transition"
          >
            {loading === "approve" ? "..." : "✓ Approve"}
          </button>
          <button
            onClick={() => handle("reject")}
            disabled={!!loading}
            className="flex-1 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 text-sm font-medium py-2 rounded-xl border border-red-200 transition"
          >
            {loading === "reject" ? "..." : "✕ Reject"}
          </button>
        </div>
      </div>
    </>
  );
}