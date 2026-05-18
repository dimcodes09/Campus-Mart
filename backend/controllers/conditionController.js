const Rental = require("../models/Rental");
const { uploadToCloudinary } = require("../utils/cloudinary");

const uploadFiles = async (files, folder) =>
  Promise.all(files.map((file) => uploadToCloudinary(file.buffer, folder)));

const MAX_CONDITION_IMAGES = 5;
const CLOUDINARY_HOST = "res.cloudinary.com";

const clientError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const extractImageUrls = (body = {}) => {
  const value = body.imageUrls || body.imageUrl || body.cloudinaryLinks || body.cloudinaryLink;
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return [
    ...new Set(
      values
        .flatMap((item) => String(item).split(/\s+/))
        .map((item) => item.trim().replace(/^,+|,+$/g, ""))
        .filter(Boolean)
    ),
  ];
};

const getCloudinaryPublicId = (imageUrl) => {
  let parsed;

  try {
    parsed = new URL(imageUrl);
  } catch {
    return null;
  }

  if (!["http:", "https:"].includes(parsed.protocol)) return null;
  if (parsed.hostname !== CLOUDINARY_HOST) return null;

  const segments = parsed.pathname.split("/").filter(Boolean);
  const uploadIndex = segments.indexOf("upload");

  if (uploadIndex < 2 || segments[uploadIndex - 1] !== "image") return null;

  let assetSegments = segments.slice(uploadIndex + 1);
  const versionIndex = assetSegments.findIndex((segment) => /^v\d+$/.test(segment));

  if (versionIndex >= 0) {
    assetSegments = assetSegments.slice(versionIndex + 1);
  }

  while (assetSegments.length && assetSegments[0].includes(",")) {
    assetSegments = assetSegments.slice(1);
  }

  if (!assetSegments.length) return null;

  const fileName = assetSegments[assetSegments.length - 1].replace(/\.[a-z0-9]+$/i, "");
  const publicId = [...assetSegments.slice(0, -1), fileName].join("/");

  return publicId || null;
};

const getLinkedImages = (body) =>
  extractImageUrls(body).map((imageUrl) => {
    const publicId = getCloudinaryPublicId(imageUrl);

    if (!publicId) {
      throw clientError("Please paste valid Cloudinary image links only.");
    }

    return {
      url: imageUrl,
      publicId,
      uploadedAt: new Date(),
    };
  });

const getConditionImagesFromRequest = async (req, folder) => {
  const linkedImages = getLinkedImages(req.body);
  const fileCount = req.files?.length || 0;
  const totalCount = fileCount + linkedImages.length;

  if (!totalCount) {
    throw clientError("No images provided");
  }

  if (totalCount > MAX_CONDITION_IMAGES) {
    throw clientError(`You can add up to ${MAX_CONDITION_IMAGES} images total.`);
  }

  const uploadedImages = fileCount ? await uploadFiles(req.files, folder) : [];

  return [...uploadedImages, ...linkedImages];
};

const getRentalForUser = async (rentalId, userId) => {
  const rental = await Rental.findById(rentalId).populate({
    path: "productId",
    select: "title rentPrice price owner imageUrl",
    populate: { path: "owner", select: "name email" },
  });

  if (!rental) return { rental: null };

  const renterId = rental.renterId?.toString();
  const ownerId = rental.productId?.owner?._id?.toString() || rental.productId?.owner?.toString();

  return {
    rental,
    isRenter: renterId === userId,
    isOwner: ownerId === userId,
  };
};

const toConditionPayload = (rental) => ({
  _id: rental._id,
  status: rental.status,
  startDate: rental.startDate,
  endDate: rental.endDate,
  totalPrice: rental.productId?.rentPrice || rental.productId?.price || 0,
  product: rental.productId,
  buyer: rental.renterId,
  seller: rental.productId?.owner,
  originalImages: rental.originalImages,
  currentImages: rental.currentImages,
  originalImagesUploadedAt: rental.originalImagesUploadedAt,
  currentImagesUploadedAt: rental.currentImagesUploadedAt,
});

const uploadOriginalCondition = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { rental, isOwner } = await getRentalForUser(req.params.rentalId, userId);

    if (!rental) return res.status(404).json({ message: "Rental not found" });
    if (!isOwner) {
      return res.status(403).json({ message: "Only the owner can upload original condition images" });
    }
    const images = await getConditionImagesFromRequest(req, "campusmart/original-condition");

    if (rental.originalImages.length + images.length > MAX_CONDITION_IMAGES) {
      return res.status(400).json({ message: `Original condition can have up to ${MAX_CONDITION_IMAGES} images.` });
    }

    rental.originalImages.push(...images);
    rental.originalImagesUploadedAt = new Date();
    await rental.save();

    res.status(200).json({
      message: "Original condition images uploaded",
      originalImages: rental.originalImages,
    });
  } catch (err) {
    console.error("[uploadOriginalCondition]", err);
    res.status(err.status || 500).json({
      message: err.status ? err.message : "Server error",
      error: err.message,
    });
  }
};

const uploadCurrentCondition = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { rental, isRenter } = await getRentalForUser(req.params.rentalId, userId);

    if (!rental) return res.status(404).json({ message: "Rental not found" });
    if (!isRenter) {
      return res.status(403).json({ message: "Only the renter can upload current condition images" });
    }
    if (!["pending", "active"].includes(rental.status)) {
      return res.status(400).json({ message: "Current condition can only be uploaded for pending or active rentals" });
    }
    const images = await getConditionImagesFromRequest(req, "campusmart/current-condition");

    if (rental.currentImages.length + images.length > MAX_CONDITION_IMAGES) {
      return res.status(400).json({ message: `Current condition can have up to ${MAX_CONDITION_IMAGES} images.` });
    }

    rental.currentImages.push(...images);
    rental.currentImagesUploadedAt = new Date();
    await rental.save();

    res.status(200).json({
      message: "Current condition images uploaded",
      currentImages: rental.currentImages,
    });
  } catch (err) {
    console.error("[uploadCurrentCondition]", err);
    res.status(err.status || 500).json({
      message: err.status ? err.message : "Server error",
      error: err.message,
    });
  }
};

const getRentalCondition = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { rental, isOwner, isRenter } = await getRentalForUser(req.params.rentalId, userId);

    if (!rental) return res.status(404).json({ message: "Rental not found" });
    if (!isOwner && !isRenter) {
      return res.status(403).json({ message: "Access denied" });
    }

    await rental.populate("renterId", "name email");
    res.status(200).json({ rental: toConditionPayload(rental) });
  } catch (err) {
    console.error("[getRentalCondition]", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  uploadOriginalCondition,
  uploadCurrentCondition,
  getRentalCondition,
};
