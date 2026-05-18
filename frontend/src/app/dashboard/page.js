"use client";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Link from "next/link";
import ConditionComparison  from "@/components/ConditionComparison";
import ConditionImageUpload from "@/components/ConditionImageUpload";
import { getRentalCondition } from "@/services/conditionService";

// ─────────────────────────────────────────────────────────────
// Constants & helpers
// ─────────────────────────────────────────────────────────────
const TABS = ["Rentals Taken", "Rentals Given", "My Listings"];
const AUTH_CHANGE_EVENT = "auth-change";
const EMPTY_DASHBOARD_DATA = { rentalsTaken: [], rentalsGiven: [], listings: [] };

const statusColors = {
  pending:   "bg-amber-50 text-amber-600 border-amber-200",
  active:    "bg-blue-50 text-blue-600 border-blue-200",
  completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
  cancelled: "bg-red-50 text-red-500 border-red-200",
  available: "bg-emerald-50 text-emerald-600 border-emerald-200",
  rented:    "bg-indigo-50 text-indigo-600 border-indigo-200",
  sold:      "bg-slate-50 text-slate-500 border-slate-200",
};

function getStoredUserSnapshot() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("user") || "";
}
function parseStoredUser(snapshot) {
  if (!snapshot) return null;
  try { return JSON.parse(snapshot); } catch { return null; }
}
function subscribeToAuthChanges(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
  };
}
function getResponseList(payload, keys) {
  const sources = [payload, payload?.data];
  for (const source of sources) {
    if (Array.isArray(source)) return source;
    for (const key of keys) {
      if (Array.isArray(source?.[key])) return source[key];
    }
  }
  return [];
}

// ─────────────────────────────────────────────────────────────
// Shared UI pieces
// ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = status?.toLowerCase() || "pending";
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${statusColors[s] || "bg-slate-50 text-slate-500 border-slate-200"}`}>
      {s}
    </span>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p className="text-slate-700 font-semibold text-base">No activity yet</p>
      <p className="text-slate-400 text-sm mt-1">{message}</p>
      <Link href="/" className="inline-block mt-4 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
        Browse Items
      </Link>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-4 animate-pulse">
      <div className="w-16 h-16 bg-slate-100 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2.5 py-1">
        <div className="h-4 bg-slate-100 rounded-lg w-2/3" />
        <div className="h-3 bg-slate-100 rounded-lg w-1/3" />
        <div className="h-3 bg-slate-100 rounded-lg w-1/4" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Condition panel — lazy-loaded inside an expanded RentalCard
// type: "taken" (renter/buyer) | "given" (owner/seller)
// ─────────────────────────────────────────────────────────────
function ConditionPanel({ rentalId, type, rentalStatus }) {
  const [conditionData, setConditionData] = useState(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!rentalId || !token) return;
    let cancelled = false;

    async function loadCondition() {
      await Promise.resolve();
      if (cancelled) return;

      setLoading(true);
      setError("");
      try {
        const res = await getRentalCondition(rentalId, token);
        if (!cancelled) setConditionData(res.rental);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load condition data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCondition();
    return () => { cancelled = true; };
  }, [rentalId, token]);

  const reload = () => {
    setLoading(true);
    getRentalCondition(rentalId, token)
      .then((res) => setConditionData(res.rental))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const isSeller = type === "given";
  const isBuyer  = type === "taken";
  const status = rentalStatus?.toLowerCase();
  const canUploadCurrent = isBuyer && ["pending", "active"].includes(status);

  return (
    <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
      {loading && (
        <p className="text-xs text-slate-400 text-center py-3">Loading condition data…</p>
      )}
      {error && (
        <p className="text-xs text-red-500 text-center py-2">{error}</p>
      )}

      {conditionData && (
        <>
          {/* Before / After comparison grid */}
          <ConditionComparison rental={conditionData} />

          {/* Seller upload prompt — only if no original images yet */}
          {isSeller && !conditionData.originalImages?.length && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
              <p className="text-xs font-semibold text-indigo-700 mb-2">
                📷 Upload original condition photos
              </p>
              <ConditionImageUpload
                rentalId={rentalId}
                mode="original"
                token={token}
                onSuccess={reload}
              />
            </div>
          )}

          {/* Buyer upload prompt — only when Active and no current images yet */}
          {canUploadCurrent && !conditionData.currentImages?.length && (
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-3">
              <p className="text-xs font-semibold text-cyan-700 mb-2">
                📦 Upload current condition photos (received state)
              </p>
              {!conditionData.originalImages?.length && (
                <p className="text-xs text-cyan-700/70 mb-2">
                  Original owner photos are not uploaded yet. You can still upload the current condition now.
                </p>
              )}
              <ConditionImageUpload
                rentalId={rentalId}
                mode="current"
                token={token}
                onSuccess={reload}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RentalCard — expandable, shows condition panel when open
// ─────────────────────────────────────────────────────────────
function RentalCard({ rental, type }) {
  const [expanded, setExpanded] = useState(false);

  const product   = rental.product || rental.productId || {};
  const productId = product._id || (typeof rental.productId === "string" ? rental.productId : rental.productId?._id);
  const title     = product.title || rental.title || "Untitled";
  const price     = product.rentPrice || product.price || rental.rentPrice || "—";
  const start     = rental.startDate ? new Date(rental.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null;
  const end       = rental.endDate   ? new Date(rental.endDate).toLocaleDateString("en-IN",   { day: "numeric", month: "short", year: "numeric" }) : null;
  const otherUser = type === "taken" ? (rental.owner || rental.ownerId || product.owner) : (rental.renter || rental.renterId);
  const days      = rental.startDate && rental.endDate
    ? Math.max(1, Math.ceil((new Date(rental.endDate) - new Date(rental.startDate)) / 86400000))
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all duration-150 overflow-hidden">
      {/* ── Card header row ── */}
      <div className="p-4 flex gap-4">
        {/* Icon */}
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <p className="font-semibold text-slate-900 text-sm truncate" style={{ fontFamily: "Sora, sans-serif" }}>{title}</p>
            <StatusBadge status={rental.status} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
            {price && <span>₹{price}/day</span>}
            {days  && <span>{days} day{days !== 1 ? "s" : ""}</span>}
            {start && end && <span>{start} → {end}</span>}
            {otherUser?.name && (
              <span className="flex items-center gap-1">
                {type === "taken" ? "From:" : "To:"}{" "}
                <span className="text-slate-600 font-medium">{otherUser.name}</span>
              </span>
            )}
          </div>
          {rental.deposit > 0 && (
            <p className="text-xs text-slate-400 mt-1">
              Deposit: <span className="text-slate-600 font-medium">₹{rental.deposit}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 self-center flex flex-col gap-1.5 items-end">
          {productId && (
            <Link
              href={`/product/${productId}`}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              View
            </Link>
          )}
          {/* Condition toggle */}
          <button
            onClick={() => setExpanded((p) => !p)}
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            {expanded ? "▲" : "▼"} Condition
          </button>
        </div>
      </div>

      {/* ── Condition panel (lazy) ── */}
      {expanded && (
        <ConditionPanel
          rentalId={rental._id}
          type={type}
          rentalStatus={rental.status}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ListingCard — unchanged from original
// ─────────────────────────────────────────────────────────────
function ListingCard({ product }) {
  const date = product.createdAt
    ? new Date(product.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all duration-150 p-4 flex gap-4">
      <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p className="font-semibold text-slate-900 text-sm truncate" style={{ fontFamily: "Sora, sans-serif" }}>{product.title}</p>
          <StatusBadge status={product.status || "available"} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
          {product.price     && <span>Buy: <span className="text-slate-600 font-medium">₹{product.price}</span></span>}
          {product.rentPrice > 0 && <span>Rent: <span className="text-slate-600 font-medium">₹{product.rentPrice}/day</span></span>}
          {product.category  && <span className="capitalize">{product.category}</span>}
          {date              && <span>Listed {date}</span>}
        </div>
      </div>
      <Link
        href={`/product/${product._id}`}
        className="flex-shrink-0 self-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
      >
        View
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Dashboard Page
// ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData]           = useState(EMPTY_DASHBOARD_DATA);
  const [loading, setLoading]     = useState(true);

  const userSnapshot = useSyncExternalStore(
    subscribeToAuthChanges,
    getStoredUserSnapshot,
    () => ""
  );
  const user = useMemo(() => parseStoredUser(userSnapshot), [userSnapshot]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    async function fetchAll() {
      setLoading(true);
      try {
        const [takenRes, givenRes, listingsRes] = await Promise.allSettled([
          api.get("/rentals/my", { params: { role: "renter" } }),
          api.get("/rentals/my", { params: { role: "owner"  } }),
          api.get("/products/my"),
        ]);
        setData({
          rentalsTaken: takenRes.status    === "fulfilled" ? getResponseList(takenRes.value.data,    ["rentals"])  : [],
          rentalsGiven: givenRes.status    === "fulfilled" ? getResponseList(givenRes.value.data,    ["rentals"])  : [],
          listings:     listingsRes.status === "fulfilled" ? getResponseList(listingsRes.value.data, ["products"]) : [],
        });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setData(EMPTY_DASHBOARD_DATA);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userInitials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const counts = [data.rentalsTaken.length, data.rentalsGiven.length, data.listings.length];

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 md:p-8 flex items-center gap-5 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 relative z-10">
          <span className="text-white text-lg font-bold">{userInitials}</span>
        </div>
        <div className="relative z-10">
          <p className="text-indigo-200 text-xs font-medium mb-0.5">Welcome back</p>
          <h1 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "Sora, sans-serif" }}>
            {user?.name || "Student"}
          </h1>
          <p className="text-indigo-300 text-xs mt-0.5">{user?.email}</p>
        </div>
        <div className="hidden sm:flex items-center gap-3 ml-auto relative z-10">
          {[
            { label: "Rented",     val: data.rentalsTaken.length },
            { label: "Rented Out", val: data.rentalsGiven.length },
            { label: "Listed",     val: data.listings.length     },
          ].map((s) => (
            <div key={s.label} className="bg-white/15 rounded-xl px-4 py-2.5 text-center">
              <p className="text-white font-bold text-lg leading-none">{s.val}</p>
              <p className="text-indigo-200 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-1.5 flex gap-1">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
              activeTab === i
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === i ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              {counts[i]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            {activeTab === 0 && (
              data.rentalsTaken.length === 0
                ? <EmptyState message="You haven't rented anything yet. Browse items to rent!" />
                : data.rentalsTaken.map((r, i) => <RentalCard key={r._id || i} rental={r} type="taken" />)
            )}
            {activeTab === 1 && (
              data.rentalsGiven.length === 0
                ? <EmptyState message="No one has rented your items yet." />
                : data.rentalsGiven.map((r, i) => <RentalCard key={r._id || i} rental={r} type="given" />)
            )}
            {activeTab === 2 && (
              data.listings.length === 0
                ? <EmptyState message="You haven't listed any items yet." />
                : data.listings.map((p, i) => <ListingCard key={p._id || i} product={p} />)
            )}
          </>
        )}
      </div>
    </div>
  );
}
