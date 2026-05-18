// frontend/src/services/conditionService.js
const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

async function readJsonResponse(res) {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return res.json();
  }

  const text = await res.text();
  const preview = text.trim().slice(0, 80);
  throw new Error(
    preview.startsWith("<!DOCTYPE") || preview.startsWith("<html")
      ? `Expected JSON from ${res.url}, but received an HTML page. Check that the backend server is running at ${BASE}.`
      : preview || `Expected JSON from ${res.url}.`
  );
}

async function handleApiResponse(res) {
  const data = await readJsonResponse(res);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || `Request failed with status ${res.status}`);
  }

  return data;
}

/**
 * Upload original condition images (seller, called during/after listing)
 */
export const uploadOriginalImages = async (rentalId, files, token, imageUrls = []) => {
  const form = new FormData();
  files.forEach((f) => form.append("images", f));
  imageUrls.forEach((url) => form.append("imageUrls", url));

  const res = await fetch(`${BASE}/api/condition/original/${rentalId}`, {
    method: "POST",
    headers: authHeaders(token),
    body: form,
  });
  return handleApiResponse(res);
};

/**
 * Upload current condition images (buyer, called when rental goes Active)
 */
export const uploadCurrentImages = async (rentalId, files, token, imageUrls = []) => {
  const form = new FormData();
  files.forEach((f) => form.append("images", f));
  imageUrls.forEach((url) => form.append("imageUrls", url));

  const res = await fetch(`${BASE}/api/condition/current/${rentalId}`, {
    method: "POST",
    headers: authHeaders(token),
    body: form,
  });
  return handleApiResponse(res);
};

/**
 * Fetch rental with both image sets
 */
export const getRentalCondition = async (rentalId, token) => {
  const res = await fetch(`${BASE}/api/condition/rental/${rentalId}`, {
    headers: authHeaders(token),
  });
  return handleApiResponse(res); // { rental: { originalImages, currentImages, ... } }
};
