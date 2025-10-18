import Area from "../models/areaModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModel.js";

/**
 * @route   POST /api/areas
 * @desc    Create a new area
 * @access  Private/Admin
 * @param   {String} name - The name of the area (required)
 * @param   {String} type - The type of the area (either 'flat' or 'weightBased', required)
 * @param   {Number} rate - The rate for the area (required)
 * @returns {Object} - A JSON object containing the newly created area data
 */
const createArea = asyncHandler(async (req, res) => {
  const { name, type, rate } = req.body;

  if (!name || !type || !rate) {
    res.status(400);
    throw new Error("Please fill all required fields.");
  }

  // Check if the area already exists
  const existingArea = await Area.findOne({ name });
  if (existingArea) {
    res.status(400);
    throw new Error("Area already exists.");
  }

  // Create the area
  const area = new Area({
    name,
    type,
    rate,
  });

  const createdArea = await area.save();
  res.status(201).json(createdArea);
});

/**
 * @route   GET /api/areas
 * @desc    Get all areas
 * @access  Public
 * @returns {Array} - A list of all areas
 */
const getAllAreas = asyncHandler(async (req, res) => {
  const areas = await Area.find({});
  res.json(areas);
});

/**
 * @route   GET /api/areas/:id
 * @desc    Get a single area by ID
 * @access  Public
 * @returns {Object} - A single area object
 */
const getAreaById = asyncHandler(async (req, res) => {
  const area = await Area.findById(req.params.id);

  if (area) {
    res.json(area);
  } else {
    res.status(404);
    throw new Error("Area not found");
  }
});

/**
 * @route   PUT /api/areas/:id
 * @desc    Update an area by ID
 * @access  Private/Admin
 * @param   {String} name - The new name of the area (optional)
 * @param   {String} type - The new type of the area ('flat' or 'weightBased', optional)
 * @param   {Number} rate - The new rate of the area (optional)
 * @returns {Object} - The updated area object
 */
const updateArea = asyncHandler(async (req, res) => {
  const { name, type, rate } = req.body;

  const area = await Area.findById(req.params.id);

  if (area) {
    area.name = name || area.name;
    area.type = type || area.type;
    area.rate = rate || area.rate;

    const updatedArea = await area.save();
    res.json(updatedArea);
  } else {
    res.status(404);
    throw new Error("Area not found");
  }
});

/**
 * @route   DELETE /api/areas/:id
 * @desc    Delete an area by ID
 * @access  Private/Admin
 * @returns {Object} - A JSON object confirming deletion
 */
const deleteArea = asyncHandler(async (req, res) => {
  const area = await Area.findByIdAndDelete(req.params.id);

  if (area) {
    res.json({ message: "Area removed successfully!" });
  } else {
    res.status(404);
    throw new Error("Area not found!");
  }
});

export { createArea, getAllAreas, getAreaById, updateArea, deleteArea };
