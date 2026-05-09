"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import Toast from "@/components/Toast";
import RentalModal from "@/components/RentalModal";
import ProductChatModal from "@/components/ProductChatModal";
import { useNotifications } from "@/context/NotificationContext";

const INR = "\u20b9";
const AUTH_CHANGE_EVENT = "auth-change";

function getStoredUserSnapshot() {
  if (typeof window === "undefined") return "";

  return localStorage.getItem("user") || "";
}

function parseStoredUser(snapshot) {
  if (!snapshot) return null;

  try {
    return JSON.parse(snapshot);
  } catch {
    return null;
  }
}

function subscribeToAuthChanges(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
  };
}

function formatCurrency(value, fallback = "N/A") {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return `${INR}${number.toLocaleString("en-IN")}`;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addNotification } = useNotifications();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDateForm, setShowDateForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [rental, setRental] = useState({ startDate: "", endDate: "" });
  const [rentalLoading, setRentalLoading] = useState(false);
  const [rentalSuccess, setRentalSuccess] = useState(false);
  const [rentalError, setRentalError] = useState("");
  const [toast, setToast] = useState(null);
  const [daysLeft, setDaysLeft] = useState(null);
  const currentUserSnapshot = useSyncExternalStore(
    subscribeToAuthChanges,
    getStoredUserSnapshot,
    () => ""
  );
  const currentUser = useMemo(
    () => parseStoredUser(currentUserSnapshot),
    [currentUserSnapshot]
  );
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await api.get(`/products/${id}`);
        const data = res.data.data || res.data.product || res.data;
        setProduct(data);
      } catch {
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProduct();
  }, [id]);

  async function handleConfirmRental() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!validateRentalDates()) return;

    setRentalLoading(true);
    setRentalError("");

    try {
      await api.post("/rentals", {
        productId: id,
        startDate: rental.startDate,
        endDate: rental.endDate,
      });

      const days = Math.max(
        1,
        Math.ceil(
          (new Date(rental.endDate) - new Date(rental.startDate)) / 86400000
        )
      );

      setDaysLeft(days);
      setRentalSuccess(true);
      setShowModal(false);
      addNotification("Rental request sent.", "success");

      setTimeout(() => {
        addNotification(`Return "${product?.title}" by ${rental.endDate}`, "warning");
      }, 5000);

      setToast({
        message: "Rental created successfully!",
        type: "success",
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create rental.";
      setRentalError(msg);
      addNotification("Rental failed.", "error");
      setToast({
        message: msg,
        type: "error",
      });
    } finally {
      setRentalLoading(false);
    }
  }

  function handleRentNowClick() {
    if (!rental.startDate || !rental.endDate) {
      setShowDateForm(true);
    } else {
      openRentalModal();
    }
  }

  function validateRentalDates() {
    if (!rental.startDate || !rental.endDate) {
      setRentalError("Please select both start and end dates.");
      return false;
    }

    if (new Date(rental.endDate) <= new Date(rental.startDate)) {
      setRentalError("End date must be after start date.");
      return false;
    }

    setRentalError("");
    return true;
  }

  function openRentalModal() {
    if (validateRentalDates()) {
      setShowModal(true);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-400">
        Loading product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="font-semibold text-red-500">{error || "Product not found."}</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline">
          Back to Browse
        </Link>
      </div>
    );
  }

  const canRent = Number(product.rentPrice) > 0 && product.status !== "rented";
  const ownerId = product.owner?._id || product.owner;
  const isOwner = currentUser?._id && ownerId && currentUser._id === ownerId.toString();

  function handleMessageSeller() {
    if (!currentUser?._id) {
      router.push("/login");
      return;
    }

    setShowChat(true);
  }

  return (
    <>
      {showModal && (
        <RentalModal
          product={product}
          rental={rental}
          onConfirm={handleConfirmRental}
          onCancel={() => setShowModal(false)}
          loading={rentalLoading}
        />
      )}

      {showChat && (
        <ProductChatModal
          product={product}
          currentUser={currentUser}
          onClose={() => setShowChat(false)}
        />
      )}

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex min-w-0 items-center gap-2 text-sm">
          <Link href="/" className="font-medium text-slate-500 transition-colors hover:text-indigo-600">
            Home
          </Link>
          <span className="text-slate-300">/</span>
          <span className="truncate text-slate-700">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.92fr)]">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-[4/3] bg-gradient-to-br from-indigo-50 to-slate-100">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title || "Product image"}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <svg className="h-24 w-24 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}

              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                {product.category && (
                  <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold capitalize text-indigo-700 shadow-sm">
                    {product.category}
                  </span>
                )}
                {product.status && (
                  <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold capitalize text-slate-600 shadow-sm">
                    {product.status}
                  </span>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="space-y-5">
              <div>
                <h1 className="text-3xl font-bold leading-tight text-slate-950">
                  {product.title}
                </h1>
                {product.description && (
                  <p className="mt-3 text-base leading-7 text-slate-600">
                    {product.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Buy Price</p>
                  <p className="mt-1 text-2xl font-bold text-indigo-950">
                    {formatCurrency(product.price, `${INR}0`)}
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Rent/day</p>
                  <p className="mt-1 text-2xl font-bold text-amber-950">
                    {formatCurrency(product.rentPrice)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Deposit</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {formatCurrency(product.deposit, "None")}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Listed by</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                    {(product.owner?.name || "S").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {product.owner?.name || "Student seller"}
                    </p>
                    {product.owner?.email && (
                      <p className="truncate text-xs text-slate-500">{product.owner.email}</p>
                    )}
                  </div>
                </div>
                {isOwner ? (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-400">
                    This is your listing
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleMessageSeller}
                    className="mt-4 w-full rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
                  >
                    Message Seller
                  </button>
                )}
              </div>

              {rentalSuccess && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  <p className="font-semibold">Rental request sent successfully.</p>
                  <p className="mt-1 text-emerald-600">
                    Return in {daysLeft} day{daysLeft !== 1 ? "s" : ""}.
                  </p>
                </div>
              )}

              {!rentalSuccess && showDateForm && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-700">Select rental dates</p>
                    <button
                      type="button"
                      onClick={() => setShowDateForm(false)}
                      className="text-xs font-semibold text-slate-400 transition-colors hover:text-slate-700"
                    >
                      Hide
                    </button>
                  </div>
                  {rentalError && (
                    <p className="mb-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                      {rentalError}
                    </p>
                  )}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="text-xs font-medium text-slate-600">
                      Start Date
                      <input
                        type="date"
                        min={today}
                        value={rental.startDate}
                        onChange={(e) => {
                          setRental({ ...rental, startDate: e.target.value });
                          setRentalError("");
                        }}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </label>
                    <label className="text-xs font-medium text-slate-600">
                      End Date
                      <input
                        type="date"
                        min={rental.startDate || today}
                        value={rental.endDate}
                        onChange={(e) => {
                          setRental({ ...rental, endDate: e.target.value });
                          setRentalError("");
                        }}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </label>
                  </div>

                  <button
                    onClick={openRentalModal}
                    disabled={!rental.startDate || !rental.endDate}
                    className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    Review Rental
                  </button>
                </div>
              )}

              {!rentalSuccess && !showDateForm && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  {canRent && (
                    <button
                      onClick={handleRentNowClick}
                      className="flex-1 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                    >
                      Rent Now
                    </button>
                  )}
                  <Link
                    href="/"
                    className="rounded-xl border border-slate-200 px-5 py-3.5 text-center text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Back to Browse
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
