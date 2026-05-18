"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
};

export default function AddProductPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [aiDescLoading, setAiDescLoading] = useState(false);
  const [aiPriceLoading, setAiPriceLoading] = useState(false);

  // 🔐 Auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  // ✨ AI Description
  async function generateDescription() {
    if (!form.title.trim()) return alert("Enter title first");
    if (!form.category) return alert("Select category first");
    setAiDescLoading(true);

    try {
      const res = await api.post("/ai/generate-description", {
        title: form.title,
        category: form.category,
        condition: form.condition,
        usageDuration: form.usageDuration,
      });
      const desc =
        res.data.description || res.data.data || res.data.result || "";

      setForm((prev) => ({ ...prev, description: desc }));
    } catch {
      alert("AI description failed");
    } finally {
      setAiDescLoading(false);
    }
  }

  // 💡 AI Price
  async function suggestPrice() {
    if (!form.title.trim()) return alert("Enter title first");
    if (!form.category) return alert("Select category first");
    setAiPriceLoading(true);

    try {
      const res = await api.post("/ai/price-recommendation", {
        title: form.title,
        category: form.category,
      });

      const price =
        res.data.suggestedPrice ||
        res.data.price ||
        res.data.data?.price ||
        res.data.recommendedPrice ||
        "";
      const rentPrice = res.data.rentPerDay || res.data.rentPrice || res.data.data?.rentPerDay || "";
      const deposit = res.data.deposit || res.data.data?.deposit || "";

      setForm((prev) => ({
        ...prev,
        price: price ? String(price) : prev.price,
        rentPrice: rentPrice ? String(rentPrice) : prev.rentPrice,
        deposit: deposit ? String(deposit) : prev.deposit,
      }));
    } catch {
      alert("Price suggestion failed");
    } finally {
      setAiPriceLoading(false);
    }
  }

  // 🚀 Submit
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.title || !form.price || !form.category) {
      setError("Title, price, category required");
      return;
    }

    try {
      setLoading(true);

      await api.post("/products", {
        ...form,
        price: Number(form.price),
        rentPrice: form.rentPrice ? Number(form.rentPrice) : undefined,
        deposit: form.deposit ? Number(form.deposit) : undefined,
      });

      // 🔔 Notifications
      addNotification("📦 Product listed successfully!", "success");

      // 🍞 Toast
      setToast({
        message: "Product listed successfully!",
        type: "success",
      });

      setSuccess(true);
      setForm(emptyForm);

      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to list product";

      setError(msg);
      addNotification("❌ Failed to list product", "error");

      setToast({
        message: msg,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            List an Item
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Add your product to marketplace
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Product title"
              className="w-full px-4 py-3 border rounded-xl"
            />

            {/* Description + AI */}
            <div>
              <div className="flex justify-between mb-1">
                <label>Description</label>
                <button type="button" onClick={generateDescription} disabled={aiDescLoading}>
                  {aiDescLoading ? "Generating..." : "Generate"}
                </button>
              </div>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-xl"
              />
            </div>

            {/* Media */}
            <input
              type="url"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="Image URL"
              className="w-full px-4 py-3 border rounded-xl"
            />

            <input
              type="url"
              name="reelVideoUrl"
              value={form.reelVideoUrl}
              onChange={handleChange}
              placeholder="Reel Video URL"
              className="w-full px-4 py-3 border rounded-xl"
            />

            {/* Category */}
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* Condition */}
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl"
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* Usage Duration */}
            <input
              type="text"
              name="usageDuration"
              value={form.usageDuration}
              onChange={handleChange}
              placeholder="Usage duration (e.g. 6 months, 1 year)"
              className="w-full px-4 py-3 border rounded-xl"
            />

            {/* Price */}
            <div className="flex gap-2">
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Price"
                className="flex-1 px-4 py-3 border rounded-xl"
              />
              <button type="button" onClick={suggestPrice} disabled={aiPriceLoading}>
                {aiPriceLoading ? "..." : "Suggest"}
              </button>
            </div>

            {/* Rent + Deposit */}
            <input
              type="number"
              name="rentPrice"
              value={form.rentPrice}
              onChange={handleChange}
              placeholder="Rent/day"
              className="w-full px-4 py-3 border rounded-xl"
            />

            <input
              type="number"
              name="deposit"
              value={form.deposit}
              onChange={handleChange}
              placeholder="Deposit"
              className="w-full px-4 py-3 border rounded-xl"
            />

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="flex-1 border py-3 rounded-xl"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl"
              >
                {loading ? "Listing..." : "List Product"}
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Toast */}
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
