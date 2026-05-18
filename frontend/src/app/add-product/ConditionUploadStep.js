"use client";
// app/add-product/ConditionUploadStep.jsx
// ─────────────────────────────────────────────────────────────
// Drop this component inside your existing add-product form.
// After the rental is created on the backend, pass the new
// rentalId + token here to let the seller upload original images.
// ─────────────────────────────────────────────────────────────

import ConditionImageUpload from "@/components/ConditionImageUpload";

/**
 * @param {string} rentalId  - ID returned after creating the rental/listing
 * @param {string} token     - JWT from auth context
 * @param {function} onDone  - callback when seller finishes uploading
 */
export default function ConditionUploadStep({ rentalId, token, onDone }) {
  return (
    <div style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
        Step: Upload Original Condition Photos
      </h2>
      <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 16 }}>
        These photos protect you as a seller. Buyers will see them before
        confirming the rental, and both sets are stored for dispute resolution.
      </p>

      <ConditionImageUpload
        rentalId={rentalId}
        mode="original"
        token={token}
        onSuccess={onDone}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOW TO WIRE INTO YOUR EXISTING add-product/page.js:
//
//  1. After your form submit creates the listing + rental:
//     const { rental } = await createRental(formData, token);
//
//  2. Show this step conditionally:
//     {rentalCreated && (
//       <ConditionUploadStep
//         rentalId={rental._id}
//         token={token}
//         onDone={() => router.push("/dashboard")}
//       />
//     )}
// ─────────────────────────────────────────────────────────────