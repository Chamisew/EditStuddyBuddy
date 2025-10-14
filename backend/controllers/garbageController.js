import Garbage from "../models/garbageModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModel.js";
import Transaction from "../models/transactionModel.js";
import { v4 as uuidv4 } from "uuid";
import QRCode from 'qrcode';
import qrcodeTerminal from 'qrcode-terminal';

/**
 * @route   POST /api/garbage
 * @desc    Create a new garbage collection request
 * @access  Private
 * @param   {Number} longitude - The longitude of the collection location (required)
 * @param   {Number} latitude - The latitude of the collection location (required)
 * @param   {String} typeOfGarbage - The type of garbage (required)
 * @param   {String} address - The address for garbage collection (required)
 * @param   {String} mobileNumber - The mobile number for contact (required)
 * @returns {Object} - A JSON object containing the newly created garbage request data
 */
const createGarbageRequest = asyncHandler(async (req, res) => {
  const { area, address, longitude, latitude, type, weight, wasteDetails, images } = req.body;

  // Require type and area. Allow address-only submissions (coords optional)
  if (!type || !area) {
    const err = new Error("Please fill all required fields (type and area).");
    err.statusCode = 400;
    throw err;
  }

  // Find the user
  const user = await User.findById(req.user._id);

  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  // Create the garbage request
  const garbage = new Garbage({
    user: req.user._id,
    address,
    longitude,
    latitude,
    type,
    area,
    weight,
    wasteDetails: wasteDetails || '',
    images: images || [],
    qrToken: uuidv4(),
    qrGeneratedAt: Date.now(),
  });

  const createdGarbage = await garbage.save();

  try {
    // DEV: Print QR to backend terminal (ASCII) and log data URL
    try {
      const scanUrl = `${process.env.COLLECTOR_FRONTEND_URL || 'http://localhost:8081'}/scanner?garbageId=${createdGarbage._id}&token=${createdGarbage.qrToken}`;
      // ASCII QR
      qrcodeTerminal.generate(scanUrl, { small: true }, (q) => console.log('\n[QR] (scan URL):\n' + q));
      // Data URL PNG (log first 200 chars only)
      QRCode.toDataURL(scanUrl, { errorCorrectionLevel: 'M', margin: 1, width: 300 }).then((dataUrl) => {
        console.log('[QR] dataUrl (truncated):', dataUrl?.slice(0, 200) + '...');
      }).catch((e) => console.warn('Failed to generate dataUrl for QR:', e));
    } catch (e) {
      console.warn('Failed to print QR in terminal:', e);
    }
    // console.log(`createdGarbage => `, createdGarbage);
    // await user.save();
    res.status(201).json(createdGarbage);
  } catch (error) {
    const err = new Error("Error saving user or creating garbage request.");
    err.statusCode = 500;
    throw err;
  }
});

/**
 * @route   GET /api/garbage
 * @desc    Get all garbage requests (Admin only)
 * @access  Private/Admin
 * @returns {Array} - A list of all garbage collection requests
 */
const getAllGarbageRequests = asyncHandler(async (req, res) => {
  const garbageRequests = await Garbage.find({})
    .populate("user", "username email contact address")
    .populate("area", "name type rate");
  res.json(garbageRequests);
});

/**
 * @route   GET /api/garbage/my-requests
 * @desc    Get all garbage requests made by the logged-in user
 * @access  Private (Authenticated User)
 * @returns {Array} - A list of garbage collection requests made by the user
 */
const getUserGarbageRequests = asyncHandler(async (req, res) => {
  // Find garbage requests where the user ID matches the logged-in user
  const garbageRequests = await Garbage.find({ user: req.user._id })
    .populate("user", "username email contact address")
    .populate("area", "name type rate");

  res.json(garbageRequests);
});

/**
 * @route   GET /api/garbage/:id
 * @desc    Get a single garbage collection request by ID
 * @access  Private
 * @returns {Object} - A single garbage request
 */
const getGarbageRequestById = asyncHandler(async (req, res) => {
  const garbage = await Garbage.findById(req.params.id)
    .populate("user", "username email contact address")
    .populate("area", "name type rate");

  if (garbage) {
    res.json(garbage);
  } else {
    const err = new Error("Garbage request not found");
    err.statusCode = 404;
    throw err;
  }
});

/**
 * @route   PUT /api/garbage/:id
 * @desc    Update a garbage request status (Admin only)
 * @access  Private/Admin
 * @param   {String} status - The new status of the garbage collection request
 * @param   {Date} collectionDate - The date of garbage collection
 * @returns {Object} - The updated garbage request
 */
const updateGarbageRequest = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const garbage = await Garbage.findById(req.params.id);

  if (garbage) {
    garbage.status = status || garbage.status;

    const updatedGarbage = await garbage.save();
    res.json(updatedGarbage);
  } else {
    const err = new Error("Garbage request not found");
    err.statusCode = 404;
    throw err;
  }
});

/**
 * @route   DELETE /api/garbage/:id
 * @desc    Delete a garbage request (Admin only)
 * @access  Private/Admin
 * @returns {Object} - A JSON object confirming deletion
 */
const deleteGarbageRequest = asyncHandler(async (req, res) => {
  const garbage = await Garbage.findByIdAndDelete(req.params.id);

  if (garbage) {
    res.json({ message: "Garbage removed successfully!" });
  } else {
    const err = new Error("Garbage not found!");
    err.statusCode = 404;
    throw err;
  }
});

const getGarbageRequestByArea = asyncHandler(async (req, res) => {
  const garbage = await Garbage.find({ area: req.params.id })
  .populate("area", "name")
  res.json(garbage);
});

export {
  createGarbageRequest,
  getAllGarbageRequests,
  getUserGarbageRequests,
  getGarbageRequestById,
  updateGarbageRequest,
  deleteGarbageRequest,
  getGarbageRequestByArea
};

// Generate QR image (data URL) for a garbage scan URL (dev)
const getGarbageQr = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const garbage = await Garbage.findById(id);
  if (!garbage) {
    res.status(404);
    throw new Error('Garbage not found');
  }

  // ensure token exists
  if (!garbage.qrToken) {
    garbage.qrToken = uuidv4();
    garbage.qrGeneratedAt = Date.now();
    await garbage.save();
  }

  const token = garbage.qrToken;
  const url = `${process.env.COLLECTOR_FRONTEND_URL || 'http://localhost:8081'}/scanner?garbageId=${garbage._id}&token=${token}`;

  const dataUrl = await QRCode.toDataURL(url, { errorCorrectionLevel: 'M', margin: 1, width: 400 });
  res.json({ dataUrl, url });
});

export { getGarbageQr };

// Export scanGarbage for routes
export { scanGarbage };

// Collector scans QR to mark garbage as collected and create a transaction.
const scanGarbage = asyncHandler(async (req, res) => {
  const { garbageId } = req.params;
  const { token } = req.body; // token scanned from QR or encoded in QR URL

  const garbage = await Garbage.findById(garbageId).populate("area");
  if (!garbage) {
    const err = new Error("Garbage request not found");
    err.statusCode = 404;
    throw err;
  }

  // Validate token
  if (!token || token !== garbage.qrToken) {
    const err = new Error("Invalid or missing QR token");
    err.statusCode = 400;
    throw err;
  }

  // Avoid duplicate processing
  if (garbage.status === "Collected" || garbage.transaction) {
    return res.status(200).json({ message: "Already collected or transaction exists", garbage });
  }

  // Mark as collected
  garbage.status = "Collected";
  garbage.collectedAt = Date.now();
  if (req.collector && req.collector._id) {
    garbage.collectedBy = req.collector._id;
  }

  // Compute amount using area rate and weight (server-side authoritative)
  let amount = 0;
  if (garbage.area && garbage.area.type === "weightBased") {
    amount = (garbage.weight || 0) * (garbage.area.rate || 0);
  } else if (garbage.area) {
    amount = garbage.area.rate || 0;
  }

  // Create transaction for user
  const transaction = new Transaction({
    user: garbage.user,
    description: `Garbage collection - request ${garbage._id}`,
    amount,
    isPaid: false,
    isRefund: false,
  });

  const savedTx = await transaction.save();
  garbage.transaction = savedTx._id;

  await garbage.save();

  res.status(200).json({ message: "Garbage marked collected and transaction created", garbage, transaction: savedTx });
});
