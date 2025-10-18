import Bin from '../models/binModel.js';
import User from '../models/userModel.js';
import Area from '../models/areaModel.js';
import WMA from '../models/wmaModel.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import Transaction from '../models/transactionModel.js';
import { createScheduleForBin } from './scheduleController.js';

// Create a new bin. Owner must be authenticated user (req.user).
const createBin = asyncHandler(async (req, res) => {
  console.log('createBin called - body:', req.body, 'user:', req.user && req.user._id);
  const { name, capacity, area: areaId } = req.body;
  if (!name || !capacity || !areaId) {
    const err = new Error('Name and capacity are required');
    err.statusCode = 400;
    throw err;
  }

  // use user's address as bin address
  const user = await User.findById(req.user._id);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  // Validate area
  const area = await Area.findById(areaId);
  if (!area) {
    const err = new Error('Area not found');
    err.statusCode = 404;
    throw err;
  }

  // Attempt to find a WMA responsible for this area by matching name/address heuristics
  let wmaToAssign = null;
  try {
    // Try to find WMA by wmaname matching area.name (case-insensitive)
    wmaToAssign = await WMA.findOne({ wmaname: new RegExp(area.name, 'i') });
    if (!wmaToAssign) {
      // fallback: find WMA whose address contains area.name
      wmaToAssign = await WMA.findOne({ address: new RegExp(area.name, 'i') });
    }
  } catch (err) {
    console.warn('WMA lookup failed:', err.message);
  }

  const bin = await Bin.create({
    name,
    capacity,
    currentLevel: 0,
    address: user.address,
    owner: req.user._id,
    area: area._id,
    wmaId: wmaToAssign ? wmaToAssign._id : undefined,
  });

  res.status(201).json(bin);
});

// Update bin level (e.g., sensor reports current fill level). Recomputes urgent flag.
const updateBinLevel = asyncHandler(async (req, res) => {
  const { binId } = req.params;
  // Accept either `added` or legacy `currentLevel` as the delta to add
  const addedRaw = req.body.added !== undefined ? req.body.added : req.body.currentLevel;
  const added = Number(addedRaw);

  if (Number.isNaN(added)) {
    const err = new Error('added (number) is required');
    err.statusCode = 400;
    throw err;
  }

  const bin = await Bin.findById(binId);
  if (!bin) {
    const err = new Error('Bin not found');
    err.statusCode = 404;
    throw err;
  }

  const previousLevel = bin.currentLevel || 0;
  let newLevel = previousLevel + added;

  // Clamp newLevel to valid range [0, capacity]
  if (typeof bin.capacity === 'number' && !Number.isNaN(bin.capacity)) {
    newLevel = Math.max(0, Math.min(bin.capacity, newLevel));
  } else {
    newLevel = Math.max(0, newLevel);
  }

  bin.currentLevel = newLevel;
  const percentage = bin.capacity ? (bin.currentLevel / bin.capacity) * 100 : 0;
  const wasUrgent = bin.isUrgent;
  bin.isUrgent = percentage >= 90;

  await bin.save();

  // If it became urgent, create a schedule for the bin so collectors can pick it up
  let createdSchedule = null;
  if (!wasUrgent && bin.isUrgent) {
    try {
      // ensure we have a wmaId; attempt fallback lookup by area name if missing
      let wmaIdToUse = bin.wmaId;
      if (!wmaIdToUse && bin.area) {
        try {
          const area = await Area.findById(bin.area);
          if (area) {
            const wmaMatch = await WMA.findOne({ wmaname: new RegExp(area.name, 'i') }) || await WMA.findOne({ address: new RegExp(area.name, 'i') });
            if (wmaMatch) wmaIdToUse = wmaMatch._id;
          }
        } catch (err) {
          console.warn('Fallback WMA lookup failed:', err.message);
        }
      }

      if (wmaIdToUse) {
        createdSchedule = await createScheduleForBin({ wmaId: wmaIdToUse, areaId: bin.area, binId: bin._id });
        console.log('Auto-created schedule for urgent bin:', createdSchedule._id);
      } else {
        console.warn('Bin became urgent but no WMA could be determined for schedule creation.');
      }
    } catch (err) {
      console.error('Failed to auto-create schedule for urgent bin:', err.message);
    }
  }

  res.json({
    bin,
    previousLevel,
    added,
    newLevel: bin.currentLevel,
    percentage: Math.round(percentage),
    createdSchedule,
  });
});

// Get all bins owned by the current user
const getBinsForUser = asyncHandler(async (req, res) => {
  const bins = await Bin.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json(bins);
});

// Delete a bin (owner or admin)
const deleteBin = asyncHandler(async (req, res) => {
  const { binId } = req.params;
  const bin = await Bin.findById(binId);
  if (!bin) {
    res.status(404);
    throw new Error('Bin not found');
  }

  // Only owner or admin can delete
  if (String(bin.owner) !== String(req.user._id) && !req.user.isAdmin) {
    const err = new Error('Not authorized to delete this bin');
    err.statusCode = 403;
    throw err;
  }

  // Use findByIdAndDelete to ensure deletion works even if `bin` is a plain object
  await Bin.findByIdAndDelete(binId);
  res.json({ message: 'Bin deleted' });
});

// Get urgent bins for a WMA (for dashboard). Requires authenticateWMA middleware to populate req.wma
const getUrgentBinsForWma = asyncHandler(async (req, res) => {
  const wmaId = req.wma._id;
  const bins = await Bin.find({ wmaId, isUrgent: true }).populate('owner', 'username address contact');
  res.json(bins);
});

// Get all bins visible to the authenticated WMA
const getAllBinsForWma = asyncHandler(async (req, res) => {
  const wmaId = req.wma._id;
  const bins = await Bin.find({ wmaId }).populate('owner', 'username address contact').populate('area', 'name');
  res.json(bins);
});

// Collector picks up/empties a bin. Similar to garbage scan flow but for bins.
const collectBin = asyncHandler(async (req, res) => {
  const { binId } = req.params;

  const bin = await Bin.findById(binId).populate('area');
  if (!bin) {
    res.status(404);
    throw new Error('Bin not found');
  }

  // Avoid duplicate: if we had a field like lastCollectedAt we could check; for now allow repeated collects
  // Compute amount using area rate (if any)
  let amount = 0;
  if (bin.area && bin.area.type === 'weightBased') {
    // For bins we don't have a weight; policy: charge flat rate
    amount = bin.area.rate || 0;
  } else if (bin.area) {
    amount = bin.area.rate || 0;
  }

  // Create transaction for bin owner (if owner exists)
  if (bin.owner) {
    const transaction = new Transaction({
      user: bin.owner,
      description: `Bin collection - bin ${bin._id}`,
      amount,
      isPaid: false,
      isRefund: false,
    });

    const savedTx = await transaction.save();
    // Optionally update bin's lastCollectedAt or reset currentLevel
    bin.currentLevel = 0;
    await bin.save();

    return res.status(200).json({ message: 'Bin collected and transaction created', bin, transaction: savedTx });
  }

  res.status(200).json({ message: 'Bin collected but no owner to bill', bin });
});

// WMA forwards an urgent bin to admin for further action.
// Marks the bin as forwardedToAdmin and creates a Schedule with status 'PendingAdmin'.
const forwardBinToAdmin = asyncHandler(async (req, res) => {
  const { binId } = req.params;
  // req.wma should be populated by authenticateWMA middleware
  const bin = await Bin.findById(binId).populate('area');
  if (!bin) {
    res.status(404);
    throw new Error('Bin not found');
  }

  if (!bin.isUrgent) {
    res.status(400);
    throw new Error('Only urgent bins can be forwarded to admin');
  }

  // Mark forwarded so admin can review. Do NOT auto-create a schedule here — admin should create it manually.
  bin.forwardedToAdmin = true;
  bin.forwardedAt = new Date();
  // If there was a linked schedule previously (e.g., admin already created one), clear it so admin must create a new schedule
  bin.scheduleId = null;
  await bin.save();

  res.json({ message: 'Bin forwarded to admin', bin });
});

// Admin can fetch bins forwarded by WMAs for review and action
const getBinsForwardedToAdmin = asyncHandler(async (req, res) => {
  const bins = await Bin.find({ forwardedToAdmin: true }).populate('owner', 'username address contact').populate('area', 'name').populate('wmaId', 'wmaname');
  res.json(bins);
});

export { createBin, updateBinLevel, getBinsForUser, deleteBin, getUrgentBinsForWma, getAllBinsForWma, collectBin, forwardBinToAdmin, getBinsForwardedToAdmin };
