"use client";
import { useRef } from "react";

export default function RentalAgreementModal({ agreement, onAccept, onCancel, loading }) {
  const textRef = useRef();

  const handleDownload = () => {
    const blob = new Blob([agreement.agreementText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agreement.agreementId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Rental Agreement</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ID: {agreement.agreementId}
            </p>
          </div>
          <span className="text-xs bg-amber-100 text-amber-700 font-medium px-3 py-1 rounded-full">
            Review Required
          </span>
        </div>

        {/* Scrollable agreement */}
        <div
          ref={textRef}
          className="flex-1 overflow-y-auto px-6 py-4 bg-slate-50"
        >
          <pre className="text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
            {agreement.agreementText}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white rounded-b-2xl">
          <p className="text-xs text-slate-400 mb-3 text-center">
            By clicking &quot;Accept &amp; Confirm&quot; you agree to the terms above.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2.5 rounded-xl border border-indigo-200 text-indigo-600 text-sm font-medium hover:bg-indigo-50 transition"
              title="Download agreement"
            >
              ↓
            </button>
            <button
              onClick={onAccept}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold transition"
            >
              {loading ? "Confirming..." : "Accept & Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
