"use client";

import { useEffect, useState } from "react";
import CATEGORIES from "@/constants/categories";

const INITIAL_FORM = {
  name: "",
  email: "",
  productName: "",
  category: "",
  budget: "",
};

export default function RequestProductPage() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const prefillId = window.setTimeout(() => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

        setFormData((current) => ({
          ...current,
          name: storedUser.name || current.name,
          email: storedUser.email || current.email,
        }));
      } catch {
        // Anonymous users can still submit the form.
      }
    }, 0);

    return () => window.clearTimeout(prefillId);
  }, []);

  const isSubmitDisabled =
    loading ||
    !formData.name.trim() ||
    !formData.email.trim() ||
    !formData.productName.trim() ||
    !formData.category.trim() ||
    !String(formData.budget).trim();

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setStatus("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setStatus("");
    setError("");

    try {
      const response = await fetch("/api/product-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          product: formData.productName.trim(),
          category: formData.category.trim(),
          budget: formData.budget,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || `Request failed with status ${response.status}`
        );
      }

      setStatus("Request submitted!");
      setFormData((current) => ({
        ...current,
        productName: "",
        category: "",
        budget: "",
      }));
    } catch (err) {
      setError(err.message || "Request failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
            Product request
          </p>
          <h1
            className="mt-2 text-2xl font-bold text-slate-950 md:text-3xl"
            style={{ fontFamily: "Sora, sans-serif" }}
          >
            Tell us what you need
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            We will use this request to find items students are looking for.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Name
              <input
                type="text"
                value={formData.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-300"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Email
              <input
                type="email"
                value={formData.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-300"
              />
            </label>
          </div>

          <label className="block text-sm font-semibold text-slate-700">
            Product name
            <input
              type="text"
              value={formData.productName}
              onChange={(event) => updateField("productName", event.target.value)}
              placeholder="Scientific calculator, lab coat, cooler..."
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-300"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Category
              <select
                value={formData.category}
                onChange={(event) => updateField("category", event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((category) => (
                  <option key={category.slug} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Budget
              <input
                type="number"
                min="0"
                value={formData.budget}
                onChange={(event) => updateField("budget", event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-300"
              />
            </label>
          </div>

          {status && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {status}
            </p>
          )}

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300 md:w-auto"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
