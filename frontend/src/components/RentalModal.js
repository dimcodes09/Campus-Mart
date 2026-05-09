"use client";

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

  return (
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
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {loading ? "Submitting..." : "Confirm Rental"}
          </button>
        </div>
      </div>
    </div>
  );
}
