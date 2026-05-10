"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import RentalAgreementModal from "./RentalAgreementModal";

const INR = "\u20b9";

function formatCurrency(value, fallback = "N/A") {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return `${INR}${number.toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "Not selected";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

async function submitProductRequest({ name, email, category, budget }) {
  try {
    const response = await fetch("/api/product-alert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        category,
        budget: Number(budget),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(`Product request failed: ${response.status}`, data);
      return false;
    }

    console.log("Product request sent successfully", data);
    return true;
  } catch (error) {
    console.log("Error sending product request:", error);
    return false;
  }
}

export default function RentalModal({
  product,
  rental,
  onConfirm,
  onCancel,
  loading = false,
}) {
  const start = rental?.startDate ? new Date(rental.startDate) : null;
  const end = rental?.endDate ? new Date(rental.endDate) : null;
  const rentalDays =
    start && end ? Math.max(1, Math.ceil((end - start) / 86400000)) : 0;

  const rentTotal = Number(product?.rentPrice || 0) * rentalDays;
  const deposit = Number(product?.deposit || 0);
  const total = rentTotal + deposit;

  const [agreement, setAgreement] = useState(null);
  const [showAgreement, setShowAgreement] = useState(false);
  const [rentalLoading, setRentalLoading] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: product?.category || "",
    budget: product?.price || "",
  });

  const isRequestSubmitDisabled =
    !formData.name.trim() ||
    !formData.email.trim() ||
    !formData.category.trim() ||
    !String(formData.budget).trim();

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleConfirmClick = async () => {
    try {
      setRentalLoading(true);

      const { data } = await api.post("/rentals/agreement", {
        productId: product._id,
        startDate: rental.startDate,
        endDate: rental.endDate,
      });

      setAgreement(data);
      setShowAgreement(true);
    } catch {
      alert("Could not generate agreement. Try again.");
    } finally {
      setRentalLoading(false);
    }
  };

  const handleRequestSubmit = async (event) => {
    event.preventDefault();

    const submitted = await submitProductRequest({
      name: formData.name,
      email: formData.email,
      category: formData.category,
      budget: formData.budget,
    });

    if (!submitted) {
      alert("Request failed. Check n8n test listener.");
      return;
    }

    setIsRequestOpen(false);
    alert("Request submitted!");
  };

  const handleAcceptAgreement = async () => {
    try {
      await onConfirm?.({
        agreementText: agreement.agreementText,
        agreementId: agreement.agreementId,
      });
    } catch {
      // The product page owns the visible error state.
    }
  };

  if (showAgreement && agreement) {
    return (
      <RentalAgreementModal
        agreement={agreement}
        onAccept={handleAcceptAgreement}
        onCancel={() => setShowAgreement(false)}
        loading={loading}
      />
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
        <button
          type="button"
          aria-label="Close rental confirmation"
          onClick={onCancel}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        <div className="relative z-[101] w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                  Confirm rental
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {product?.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={onCancel}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                aria-label="Close"
              >
                x
              </button>
            </div>
          </div>

          <div className="space-y-4 px-6 py-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Start
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatDate(rental?.startDate)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  End
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatDate(rental?.endDate)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm">
                <span className="text-slate-500">Duration</span>
                <span className="font-semibold text-slate-900">
                  {rentalDays} day{rentalDays !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm">
                <span className="text-slate-500">
                  Rent ({formatCurrency(product?.rentPrice, `${INR}0`)}/day)
                </span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(rentTotal, `${INR}0`)}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm">
                <span className="text-slate-500">Refundable deposit</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(deposit, "None")}
                </span>
              </div>

              <div className="flex items-center justify-between bg-indigo-50 px-4 py-4">
                <span className="text-sm font-bold text-indigo-950">Total due</span>
                <span className="text-xl font-bold text-indigo-700">
                  {formatCurrency(total, `${INR}0`)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => setIsRequestOpen(true)}
              className="flex-1 rounded-xl border border-indigo-200 px-4 py-3 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
            >
              Product Request
            </button>

            <button
              type="button"
              onClick={handleConfirmClick}
              disabled={rentalLoading}
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {rentalLoading ? "Loading..." : "Confirm Rental"}
            </button>
          </div>
        </div>
      </div>

      {isRequestOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            aria-label="Close product request"
            onClick={() => setIsRequestOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <form
            onSubmit={handleRequestSubmit}
            className="relative z-[121] w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-slate-950">Product Request</h3>

            <div className="mt-5 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Name
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Email
                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData({ ...formData, email: event.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Category
                <input
                  type="text"
                  value={formData.category}
                  onChange={(event) =>
                    setFormData({ ...formData, category: event.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Budget
                <input
                  type="number"
                  min="0"
                  value={formData.budget}
                  onChange={(event) =>
                    setFormData({ ...formData, budget: event.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setIsRequestOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isRequestSubmitDisabled}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
