"use client";

import Link from "next/link";
import { useState, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

const categoryColors = {
  books:       "bg-emerald-100 text-emerald-700",
  electronics: "bg-blue-100 text-blue-700",
  furniture:   "bg-amber-100 text-amber-700",
  clothing:    "bg-pink-100 text-pink-700",
  sports:      "bg-orange-100 text-orange-700",
  stationery:  "bg-purple-100 text-purple-700",
  default:     "bg-slate-100 text-slate-600",
};

const AUTH_CHANGE_EVENT = "auth-change";

function getSnapshot() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("user") || "";
}
function subscribe(cb) {
  window.addEventListener("storage", cb);
  window.addEventListener(AUTH_CHANGE_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(AUTH_CHANGE_EVENT, cb);
  };
}

export default function ProductCard({ product, onDeleted }) {
  const router = useRouter();
  const [deleting, setDeleting]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "");
  const currentUser = useMemo(() => {
    if (!snapshot) return null;
    try { return JSON.parse(snapshot); } catch { return null; }
  }, [snapshot]);

  const ownerId = product.owner?._id || product.owner;
  const isOwner =
    currentUser?._id && ownerId && currentUser._id === ownerId.toString();

  const colorClass =
    categoryColors[product.category?.toLowerCase()] || categoryColors.default;

  /* ── Delete handler ── */
  async function handleDelete() {
    try {
      setDeleting(true);
      await api.delete(`/products/${product._id}`);
      setShowConfirm(false);
      if (typeof onDeleted === "function") onDeleted(product._id);
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.message || "Failed to delete product.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* ── Delete confirmation overlay ── */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => !deleting && setShowConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 mb-4">
              <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete listing?</h3>
            <p className="mt-1.5 text-sm text-slate-500">
              <strong className="text-slate-700">&quot;{product.title}&quot;</strong> will be permanently removed. This cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Card ── */}
      <div className="bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-200 group overflow-hidden flex flex-col">
        <div className="bg-gradient-to-br from-indigo-50 to-slate-100 h-48 flex items-center justify-center relative">
          <svg className="w-14 h-14 text-indigo-200 group-hover:text-indigo-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.title || "Product image"}
              className="absolute inset-0 h-full w-full object-contain p-2"
              onError={(event) => { event.currentTarget.style.display = "none"; }}
            />
          )}
          {product.category && (
            <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${colorClass}`}>
              {product.category}
            </span>
          )}
          {product.status === "rented" && (
            <span className="absolute top-3 right-3 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-500 text-white shadow-md">
              🔒 Rented
            </span>
          )}
          {product.status === "sold" && (
            <>
              {/* Full overlay for sold */}
              <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                <span className="text-white font-extrabold text-2xl tracking-widest uppercase rotate-[-15deg] border-4 border-white/80 px-4 py-1 rounded-lg bg-slate-900/60 shadow-lg">
                  SOLD
                </span>
              </div>
              <span className="absolute top-3 right-3 text-xs font-bold px-3 py-1.5 rounded-full bg-slate-700 text-white shadow-md">
                Sold
              </span>
            </>
          )}

          {/* Owner quick-action buttons — hide for sold */}
          {isOwner && product.status !== "rented" && product.status !== "sold" && (
            <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link
                href={`/edit-product/${product._id}`}
                title="Edit"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/95 shadow text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
              <button
                title="Delete"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); setShowConfirm(true); }}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/95 shadow text-red-500 hover:bg-red-500 hover:text-white transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col gap-3 flex-1">
          <h3
            className="font-semibold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors"
            style={{ fontFamily: "Sora, sans-serif" }}
          >
            {product.title}
          </h3>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-medium">Buy</span>
              <span className="text-lg font-bold text-slate-900">₹{product.price}</span>
            </div>
            {product.rentPrice && (
              <div className="flex flex-col items-end">
                <span className="text-xs text-slate-400 font-medium">Rent/day</span>
                <span className="text-base font-semibold text-indigo-600">₹{product.rentPrice}</span>
              </div>
            )}
          </div>

          {/* Owner buttons row */}
          {isOwner ? (
            <div className="flex gap-2">
              {product.status !== "sold" && (
                <Link
                  href={`/edit-product/${product._id}`}
                  className="flex-1 text-center text-xs font-semibold border border-indigo-200 text-indigo-600 py-2 rounded-xl transition hover:bg-indigo-50"
                >
                  ✏️ Edit
                </Link>
              )}
              {product.status !== "sold" && (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="flex-1 text-xs font-semibold border border-red-200 text-red-500 py-2 rounded-xl transition hover:bg-red-50"
                >
                  🗑 Delete
                </button>
              )}
              {product.status === "sold" && (
                <span className="flex-1 text-center text-xs font-bold text-slate-400 py-2 rounded-xl border border-slate-200 bg-slate-50">
                  ✓ Marked as Sold
                </span>
              )}
            </div>
          ) : product.status === "available" ? (
            <Link
              href={`/product/${product._id}`}
              className="w-full text-center text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl transition-colors duration-150 mt-1"
            >
              View Details
            </Link>
          ) : (
            <span className="w-full text-center text-sm font-semibold text-slate-400 py-2.5 rounded-xl border border-slate-200 bg-slate-50 mt-1 block">
              {product.status === "sold" ? "Item Sold" : "Currently Rented"}
            </span>
          )}

          {/* Also keep View Details for owner (only when available) */}
          {isOwner && product.status !== "sold" && (
            <Link
              href={`/product/${product._id}`}
              className="w-full text-center text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 py-2 rounded-xl transition-colors duration-150"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
