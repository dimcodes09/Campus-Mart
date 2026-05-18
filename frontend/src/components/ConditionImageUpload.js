"use client";
// components/ConditionImageUpload.jsx
// Used by SELLER (mode="original") and BUYER (mode="current")
import { useState } from "react";
import { uploadOriginalImages, uploadCurrentImages } from "@/services/conditionService";

const MAX_IMAGES = 5;

function parseImageLinks(value = "") {
  return [
    ...new Set(
      value
        .split(/\s+/)
        .map((item) => item.trim().replace(/^,+|,+$/g, ""))
        .filter(Boolean)
    ),
  ];
}

function isCloudinaryImageLink(value) {
  try {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      url.hostname === "res.cloudinary.com" &&
      url.pathname.includes("/image/upload/")
    );
  } catch {
    return false;
  }
}

export default function ConditionImageUpload({ rentalId, mode, token, onSuccess }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [linkInput, setLinkInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const isSeller = mode === "original";
  const label = isSeller ? "Original Condition (Seller)" : "Current Condition (Buyer)";
  const accent = isSeller ? "#4f46e5" : "#0891b2";
  const pastedLinks = parseImageLinks(linkInput);
  const totalImages = files.length + pastedLinks.length;
  const overLimit = totalImages > MAX_IMAGES;
  const isUploadDisabled = loading || !totalImages || overLimit;

  const handleFileChange = (event) => {
    const linkCount = parseImageLinks(linkInput).length;
    const availableSlots = Math.max(0, MAX_IMAGES - linkCount);
    const selectedFiles = Array.from(event.target.files);
    const selected = selectedFiles.slice(0, availableSlots);

    setFiles(selected);
    setPreviews(selected.map((file) => URL.createObjectURL(file)));
    setError(
      selectedFiles.length > selected.length
        ? `You can add up to ${MAX_IMAGES} images total.`
        : ""
    );
  };

  const handleLinkInputChange = (event) => {
    const nextValue = event.target.value;
    const nextLinkCount = parseImageLinks(nextValue).length;

    setLinkInput(nextValue);
    setError(
      files.length + nextLinkCount > MAX_IMAGES
        ? `You can add up to ${MAX_IMAGES} images total.`
        : ""
    );
  };

  const handleUpload = async () => {
    const imageUrls = parseImageLinks(linkInput);

    if (!files.length && !imageUrls.length) {
      return setError("Please select images or paste at least one Cloudinary link.");
    }

    if (files.length + imageUrls.length > MAX_IMAGES) {
      return setError(`You can add up to ${MAX_IMAGES} images total.`);
    }

    if (imageUrls.some((url) => !isCloudinaryImageLink(url))) {
      return setError("Please paste valid Cloudinary image links only.");
    }

    setLoading(true);
    setError("");
    try {
      const uploader = isSeller ? uploadOriginalImages : uploadCurrentImages;
      const data = await uploader(rentalId, files, token, imageUrls);
      setDone(true);
      onSuccess?.(data);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={styles.successBox(accent)}>
        {label} images saved successfully!
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h3 style={{ ...styles.heading, color: accent }}>{label}</h3>
      <p style={styles.hint}>
        {isSeller
          ? "Upload up to 5 photos showing the product's condition before renting out."
          : "Upload up to 5 photos showing the product's condition when you received it."}
      </p>

      <label style={styles.dropzone(accent)}>
        <span>Click to select images (max {MAX_IMAGES})</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </label>

      <div style={styles.linkBox}>
        <label style={styles.linkLabel}>Paste Cloudinary image link</label>
        <textarea
          value={linkInput}
          onChange={handleLinkInputChange}
          placeholder="https://res.cloudinary.com/.../image/upload/..."
          rows={2}
          style={styles.linkInput(accent)}
        />
        <div style={styles.linkMeta}>
          <span>One link per line</span>
          <span>{totalImages}/{MAX_IMAGES} selected</span>
        </div>
      </div>

      {(previews.length > 0 || pastedLinks.length > 0) && (
        <div style={styles.previewGrid}>
          {previews.map((src, index) => (
            <img
              key={`file-${index}`}
              src={src}
              alt={`preview-${index}`}
              style={styles.previewImg}
            />
          ))}
          {pastedLinks.map((src, index) => (
            <img
              key={`link-${src}`}
              src={src}
              alt={`link-preview-${index}`}
              style={styles.previewImg}
            />
          ))}
        </div>
      )}

      {error && <p style={styles.error}>{error}</p>}

      <button
        onClick={handleUpload}
        disabled={isUploadDisabled}
        style={styles.btn(accent, isUploadDisabled)}
      >
        {loading ? "Uploading..." : "Upload / Save Images"}
      </button>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "20px 24px",
    marginBottom: 16,
    background: "#fafafa",
  },
  heading: { margin: "0 0 6px", fontSize: 15, fontWeight: 600 },
  hint: { margin: "0 0 14px", fontSize: 13, color: "#6b7280" },
  dropzone: (accent) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `2px dashed ${accent}`,
    borderRadius: 8,
    padding: "20px 0",
    cursor: "pointer",
    color: accent,
    fontWeight: 500,
    fontSize: 14,
    marginBottom: 12,
  }),
  linkBox: {
    marginBottom: 12,
  },
  linkLabel: {
    display: "block",
    marginBottom: 6,
    color: "#374151",
    fontSize: 13,
    fontWeight: 600,
  },
  linkInput: (accent) => ({
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    color: "#111827",
    fontSize: 13,
    outline: "none",
    padding: "10px 12px",
    resize: "vertical",
    background: "#fff",
    boxShadow: `0 0 0 0 ${accent}`,
  }),
  linkMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 6,
    color: "#6b7280",
    fontSize: 12,
  },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
    gap: 8,
    marginBottom: 12,
  },
  previewImg: {
    width: "100%",
    aspectRatio: "1",
    objectFit: "cover",
    borderRadius: 6,
    border: "1px solid #e5e7eb",
  },
  error: { color: "#dc2626", fontSize: 13, marginBottom: 8 },
  btn: (accent, disabled) => ({
    background: disabled ? "#d1d5db" : accent,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 20px",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 14,
    width: "100%",
  }),
  successBox: (accent) => ({
    border: `1px solid ${accent}`,
    borderRadius: 10,
    padding: "14px 18px",
    background: "#f0fdf4",
    color: "#166534",
    fontWeight: 500,
    fontSize: 14,
  }),
};
