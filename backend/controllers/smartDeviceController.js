import SmartDevice from "../models/smartDeviceModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModel.js";
import Area from "../models/areaModel.js";

/**
 * @route   POST /api/smartDevices
 * @desc    Create a new smart device
 * @access  Private
 * @param   {String} area - The area ID where the device is located (required)
 * @param   {Number} longitude - The longitude of the device's location (required)
 * @param   {Number} latitude - The latitude of the device's location (required)
 * @param   {String} type - The garbage type the device monitors (required)
 * @returns {Object} - A JSON object containing the newly created smart device data
 */
const createSmartDevice = asyncHandler(async (req, res) => {
  const { area, longitude, latitude, type } = req.body;

  if (!longitude || !latitude || !type || !area) {
    res.status(400);
    throw new Error("Please fill all required fields.");
  }

  // Check if the user exists
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  // Check if the area exists
  const existingArea = await Area.findById(area);
  if (!existingArea) {
    res.status(404);
    throw new Error("Area not found.");
  }

  // Create the smart device
  const smartDevice = new SmartDevice({
    userId: req.user._id,
    longitude,
    latitude,
    type,
    area,
  });

  const createdDevice = await smartDevice.save();
  res.status(201).json(createdDevice);
});

/**
 * @route   GET /api/smartDevices
 * @desc    Get all smart devices (Admin only)
 * @access  Private/Admin
 * @returns {Array} - A list of all smart devices
 */
const getAllSmartDevices = asyncHandler(async (req, res) => {
  const devices = await SmartDevice.find({})
    .populate("userId", "username email contact address")
    .populate("area", "name location");
  res.json(devices);
});

/**
 * @route   GET /api/smartDevices/my-devices
 * @desc    Get all smart devices created by the logged-in user
 * @access  Private (Authenticated User)
 * @returns {Array} - A list of smart devices created by the user
 */
const getUserSmartDevices = asyncHandler(async (req, res) => {
  const devices = await SmartDevice.find({ userId: req.user._id })
    .populate("userId", "username email contact address")
    .populate("area", "name location");

  res.json(devices);
});

/**
 * @route   GET /api/smartDevices/:id
 * @desc    Get a single smart device by ID
 * @access  Private
 * @returns {Object} - A single smart device object
 */
const getSmartDeviceById = asyncHandler(async (req, res) => {
  const device = await SmartDevice.findById(req.params.id)
    .populate("userId", "username email contact address")
    .populate("area", "name type rate");

  if (device) {
    res.json(device);
  } else {
    res.status(404);
    throw new Error("Smart device not found");
  }
});

/**
 * @route   PUT /api/smartDevices/:id
 * @desc    Update a smart device's details
 * @access  Private/Admin
 * @param   {String} type - The new garbage type monitored by the device
 * @param   {Number} latitude - The updated latitude of the device
 * @param   {Number} longitude - The updated longitude of the device
 * @returns {Object} - The updated smart device object
 */
const updateSmartDevice = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const device = await SmartDevice.findById(req.params.id);

  if (device) {
    device.status = status || device.status;

    const updatedDevice = await device.save();
    res.json(updatedDevice);
  } else {
    res.status(404);
    throw new Error("Smart device not found");
  }
});

/**
 * @route   PATCH /api/smartDevices/:id/garbageStatus
 * @desc    Update the garbage status of a smart device
 * @access  Private/Admin
 * @param   {String} garbageStatus - The new garbage status of the device
 * @returns {Object} - The updated smart device object
 */
const updateGarbageStatusByID = asyncHandler(async (req, res) => {
  const { garbageStatus } = req.body;

  // console.log(`req.param.id => `, req.params.id);
  const device = await SmartDevice.findById(req.params.id);

  if (device) {
    device.garbageStatus = garbageStatus || device.garbageStatus;

    const updatedDevice = await device.save();
    res.json(updatedDevice);
  } else {
    res.status(404);
    throw new Error("Smart device not found");
  }
});

/**
 * @route   DELETE /api/smartDevices/:id
 * @desc    Delete a smart device (Admin only)
 * @access  Private/Admin
 * @returns {Object} - A JSON object confirming deletion
 */
const deleteSmartDevice = asyncHandler(async (req, res) => {
  const device = await SmartDevice.findByIdAndDelete(req.params.id);

  if (device) {
    res.json({ message: "Smart device removed successfully!" });
  } else {
    res.status(404);
    throw new Error("Smart device not found!");
  }
});

export {
  createSmartDevice,
  getAllSmartDevices,
  getUserSmartDevices,
  getSmartDeviceById,
  updateSmartDevice,
  updateGarbageStatusByID,
  deleteSmartDevice,
};
