"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import Toast from "@/components/Toast";
import { useNotifications } from "@/context/NotificationContext";

const CATEGORIES = [
  { value: "books",       label: "Books" },
  { value: "electronics", label: "Electronics" },
  { value: "furniture",   label: "Furniture" },
  { value: "clothing",    label: "Clothing" },
  { value: "sports",      label: "Sports" },
  { value: "stationery",  label: "Stationery" },
  { value: "other",       label: "Other" },
];

const CONDITIONS = [
  { value: "new",      label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good",     label: "Good" },
  { value: "fair",     label: "Fair" },
  { value: "old",      label: "Old" },
];

const STATUSES = [
  { value: "available", label: "Available" },
  { value: "rented",    label: "Rented" },
  { value: "sold",      label: "Sold" },
];

const emptyForm = {
  title: "",
  description: "",
  imageUrl: "",
  reelVideoUrl: "",
  price: "",
  rentPrice: "",
  deposit: "",
  category: "",
  condition: "good",
  usageDuration: "",
  status: "available",
};

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addNotification } = useNotifications();

  const [form, setForm]         = useState(emptyForm);
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError]       = useState("");
  const [toast, setToast]       = useState(null);

  /* ── Auth + data fetch ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    async function loadProduct() {
      try {
        const res = await api.get(`/products/${id}`);
        const p   = res.data.product || res.data.data || res.data;

        // Verify ownership on the client side too
        const storedUser = localStorage.getItem("user");
        const user       = storedUser ? JSON.parse(storedUser) : null;
        const ownerId    = p.owner?._id || p.owner;

        if (!user || user._id !== ownerId?.toString()) {
          router.push(`/product/${id}`);
          return;
        }

        setForm({
          title:         p.title            || "",
          description:   p.description      || "",
          imageUrl:      p.imageUrl         || "",
          reelVideoUrl:  p.reelVideoUrl     || "",
          price:         p.price     != null ? String(p.price)     : "",
          rentPrice:     p.rentPrice != null ? String(p.rentPrice) : "",
          deposit:       p.deposit   != null ? String(p.deposit)   : "",
          category:      p.category         || "",
          condition:     p.condition        || "good",
          usageDuration: p.usageDuration    || "",
          status:        p.status           || "available",
        });
      } catch {
        setError("Failed to load product.");
      } finally {
        setFetching(false);
      }
    }

    if (id) loadProduct();
  }, [id, router]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.price || !form.category) {
      setError("Title, price, and category are required.");
      return;
    }

    try {
      setLoading(true);
      await api.put(`/products/${id}`, {
        ...form,
        price:     Number(form.price),
        rentPrice: form.rentPrice ? Number(form.rentPrice) : 0,
        deposit:   form.deposit   ? Number(form.deposit)   : 0,
      });

      addNotification("✏️ Product updated successfully!", "success");
      setToast({ message: "Product updated!", type: "success" });

      setTimeout(() => router.push(`/product/${id}`), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update product.";
      setError(msg);
      addNotification("❌ Update failed", "error");
      setToast({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  /* ── Loading state ── */
  if (fetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-400">
        Loading product…
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5";

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">

        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Link
            href={`/product/${id}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600"
          >
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Listing</h1>
            <p className="text-sm text-slate-500">Update your product details below</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div>
              <label className={labelCls}>Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Product title"
                className={inputCls}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your product…"
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Media */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://…"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Reel Video URL</label>
                <input
                  type="url"
                  name="reelVideoUrl"
                  value={form.reelVideoUrl}
                  onChange={handleChange}
                  placeholder="https://…"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Category + Condition */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Category *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputCls}
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Condition</label>
                <select
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                  className={inputCls}
                >
                  {CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Usage Duration */}
            <div>
              <label className={labelCls}>Usage Duration</label>
              <input
                type="text"
                name="usageDuration"
                value={form.usageDuration}
                onChange={handleChange}
                placeholder="e.g. 6 months, 1 year"
                className={inputCls}
              />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Rent/day (₹)</label>
                <input
                  type="number"
                  name="rentPrice"
                  min="0"
                  value={form.rentPrice}
                  onChange={handleChange}
                  placeholder="0"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Deposit (₹)</label>
                <input
                  type="number"
                  name="deposit"
                  min="0"
                  value={form.deposit}
                  onChange={handleChange}
                  placeholder="0"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className={labelCls}>Listing Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inputCls}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Link
                href={`/product/${id}`}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                {loading ? "Saving…" : "Save Changes"}
              </button>
            </div>

          </form>
        </div>
      </div>

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
