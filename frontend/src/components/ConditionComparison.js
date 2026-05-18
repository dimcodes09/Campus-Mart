"use client";
// components/ConditionComparison.jsx
// Drop into dashboard — shows original vs current images side by side

import { useState } from "react";

const statusColors = {
  Pending:   { bg: "#fef3c7", text: "#92400e" },
  Active:    { bg: "#dbeafe", text: "#1e40af" },
  Completed: { bg: "#d1fae5", text: "#065f46" },
  Cancelled: { bg: "#fee2e2", text: "#991b1b" },
  pending:   { bg: "#fef3c7", text: "#92400e" },
  active:    { bg: "#dbeafe", text: "#1e40af" },
  completed: { bg: "#d1fae5", text: "#065f46" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

function ImageGrid({ images, emptyMsg }) {
  const [lightbox, setLightbox] = useState(null);

  if (!images?.length)
    return <p style={styles.empty}>{emptyMsg}</p>;

  return (
    <>
      <div style={styles.grid}>
        {images.map((img, i) => (
          <img
            key={i}
            src={img.url}
            alt={`condition-${i + 1}`}
            style={styles.thumb}
            onClick={() => setLightbox(img.url)}
          />
        ))}
      </div>

      {lightbox && (
        <div style={styles.overlay} onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="full" style={styles.lightboxImg} />
          <span style={styles.closeBtn}>✕</span>
        </div>
      )}
    </>
  );
}

export default function ConditionComparison({ rental }) {
  if (!rental) return null;

  const { status, product, originalImages, currentImages,
          originalImagesUploadedAt, currentImagesUploadedAt } = rental;
  const sc = statusColors[status] || statusColors.Pending;

  return (
    <div style={styles.card}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <p style={styles.productName}>{product?.title || "Product"}</p>
          <p style={styles.meta}>₹{rental.totalPrice}/day</p>
        </div>
        <span style={{ ...styles.badge, background: sc.bg, color: sc.text }}>
          {status}
        </span>
      </div>

      {/* ── Condition columns ── */}
      <div style={styles.columns}>
        {/* Original */}
        <div style={styles.col}>
          <div style={styles.colHeader("#4f46e5")}>
            🏷️ Original Condition
            {originalImagesUploadedAt && (
              <span style={styles.timestamp}>
                {new Date(originalImagesUploadedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <ImageGrid
            images={originalImages}
            emptyMsg="Seller hasn't uploaded original images yet."
          />
        </div>

        {/* Divider */}
        <div style={styles.divider}>VS</div>

        {/* Current */}
        <div style={styles.col}>
          <div style={styles.colHeader("#0891b2")}>
            📦 Current Condition
            {currentImagesUploadedAt && (
              <span style={styles.timestamp}>
                {new Date(currentImagesUploadedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <ImageGrid
            images={currentImages}
            emptyMsg="Buyer hasn't uploaded current condition images yet."
          />
        </div>
      </div>
    </div>
  );
}

// ── inline styles ───────────────────────────────────────────
const styles = {
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: "20px 24px",
    marginBottom: 20,
    background: "#fff",
    boxShadow: "0 1px 4px rgba(0,0,0,.06)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  productName: { fontWeight: 700, fontSize: 16, margin: 0 },
  meta:        { color: "#6b7280", fontSize: 13, margin: "2px 0 0" },
  badge: {
    fontSize: 12,
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: 20,
  },
  columns: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    gap: 16,
    alignItems: "start",
  },
  col: { minWidth: 0 },
  colHeader: (color) => ({
    fontSize: 13,
    fontWeight: 600,
    color,
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }),
  timestamp: { fontSize: 11, color: "#9ca3af", fontWeight: 400 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
    gap: 6,
  },
  thumb: {
    width: "100%",
    aspectRatio: "1",
    objectFit: "cover",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    transition: "opacity .15s",
  },
  empty: { fontSize: 13, color: "#9ca3af", fontStyle: "italic" },
  divider: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    color: "#d1d5db",
    fontSize: 13,
    paddingTop: 24,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    cursor: "zoom-out",
  },
  lightboxImg: {
    maxWidth: "90vw",
    maxHeight: "90vh",
    borderRadius: 10,
    objectFit: "contain",
  },
  closeBtn: {
    position: "absolute",
    top: 20,
    right: 24,
    color: "#fff",
    fontSize: 22,
    cursor: "pointer",
  },
};
