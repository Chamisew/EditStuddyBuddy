import Collector from "../models/collectorModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { generateCollectorToken } from "../utils/createToken.js";

/**
 * @route   POST /api/collector
 * @desc    Create a new schedule request
 * @access  Private
 * @param   {Object} wmaId - The id of the wast management authority (required)
 * @param   {Object} collectorId - The id of the collector (required)
 * @param   {String} area - The area of the collection (required)
 * @param   {String} time - the time of schedule (required)
 * @param   {String} date - the date of schedule (required)
 * @returns {Object} - A JSON object containing the newly created schedule data
 */
const createCollector = asyncHandler(async (req, res) => {
  const { wmaId, truckNumber, collectorName, collectorNIC, contactNo } =
    req.body;

  if (!wmaId || !truckNumber || !collectorName || !collectorNIC || !contactNo) {
    res.status(400);
    throw new Error("Please fill all required fields.");
  }

  const collector = new Collector({
    wmaId,
    truckNumber,
    collectorName,
    collectorNIC,
    contactNo,
    statusOfCollector: "Available",
  });

  const createdCollector = await collector.save();
  res.status(201).json(createdCollector);
});

/**
 * @route   POST /api/collector/auth
 * @desc    Authenticate user and get token
 * @access  Public
 * @param   {String} collectorNIC - The email of the user (required)
 * @param   {String} truckNumber - The password of the user (required)
 * @returns {Object} - A JSON object containing the user data and the authentication token
 * @throws  {400} If the collectorNIC or truckNumber is missing or invalid
 * @throws  {401} If the collectorNIC or truckNumber is incorrect
 * @throws  {500} If a server error occurs
 */
const loginCollector = asyncHandler(async (req, res) => {
  const { collectorNIC, truckNumber } = req.body;

  // Check if user exists
  const existingCollector = await Collector.findOne({ collectorNIC });

  if (existingCollector) {
    // Compare the provided password with the hashed password in the database
    // const isPasswordValid = await bcrypt.compare(truckNumber, existingCollector.truckNumber);

    if (existingCollector.truckNumber === truckNumber) {
      // Generate token if the user is valid
      const token = generateCollectorToken(res, existingCollector._id);

      res.status(201).json({
        _id: existingCollector._id,
        wmaId: existingCollector.wmaId,
        truckNumber: existingCollector.truckNumber,
        collectorName: existingCollector.collectorName,
        collectorNIC: existingCollector.collectorNIC,
        contactNo: existingCollector.contactNo,
        statusOfCollector: existingCollector.statusOfCollector,
        token: token,
      });
    } else {
      // Send error response for incorrect password
      res.status(401);
      throw new Error("Invalid truck number.");
    }
  } else {
    // Send error response if user is not found
    res.status(404);
    throw new Error("Collector not found.");
  }
});

/**
 * @route   GET /api/collector/profile
 * @desc    Retrieve the current collector's profile
 * @access  Private
 * @header  {String} Authorization - The bearer token of the collector (required)
 * @returns {Object} - A JSON object containing the collectores's profile data
 * @throws  {401} If the collector is not authenticated
 * @throws  {500} If a collector error occurs
 */
const getCurrentCollectorProfile = asyncHandler(async (req, res) => {
  console.log("req.collector:", req.collector);
  const collector = await Collector.findById(req.collector._id);
  if (collector) {
    res.json({
      _id: collector._id,
      wmaId: collector.wmaId,
      truckNumber: collector.truckNumber,
      collectorName: collector.collectorName,
      collectorNIC: collector.collectorNIC,
      contactNo: collector.contactNo,
      statusOfCollector: collector.statusOfCollector,
    });
  } else {
    res.status(404);
    throw new Error("collector not found!");
  }
});

/**
 * @route   GET /api/schedule
 * @desc    Get all schedule requests (Admin only)
 * @access  Private/Admin
 * @returns {Array} - A list of all schedules
 */
const getAllCollectors = asyncHandler(async (req, res) => {
  const collectors = await Collector.find({}).populate("wmaId", "wmaname");
  res.json(collectors);
});

/**
 * @route   GET /api/schedules/my-schedules
 * @desc    Get all schedules assingd to the truck
 * @access  Private (Authenticated Truck)
 * @returns {Array} - A list of schedules assingd to the truck
 */
const getCollectorsByWMA = asyncHandler(async (req, res) => {
  const collectors = await Collector.find({ wmaId: req.params.id });
  res.json(collectors);
});

/**
 * @route   GET /api/schedule/:id
 * @desc    Get a single schedule by ID
 * @access  Private
 * @returns {Object} - A single schedule
 */
const getCollectorById = asyncHandler(async (req, res) => {
  const collector = await Collector.findById(req.params.id);
  if (collector) {
    res.json(collector);
  } else {
    res.status(404);
    throw new Error("Collector not found");
  }
});

/**
 * @route   PUT /api/schedule/:id
 * @desc    Update a schedule status (Admin only)
 * @access  Private/Admin
 * @param   {Object} truckId - The id of the truck (required)
 * @param   {String} area - The area of the collection (required)
 * @param   {String} time - the time of schedule (required)
 * @param   {String} date - the date of schedule (required)
 * @returns {Object} - The updated garbage request
 */
const updateCollector = asyncHandler(async (req, res) => {
  const {
    wmaId,
    truckNumber,
    collectorName,
    collectorNIC,
    statusOfCollector,
    contactNo,
  } = req.body;

  const collector = await Collector.findById(req.params.id);

  if (collector) {
    collector.wmaId = wmaId || collector.wmaId;
    collector.truckNumber = truckNumber || collector.truckNumber;
    collector.collectorName = collectorName || collector.collectorName;
    collector.collectorNIC = collectorNIC || collector.collectorNIC;
    collector.contactNo = contactNo || collector.contactNo;
    collector.statusOfCollector =
      statusOfCollector || collector.statusOfCollector;

    const updatedCollector = await collector.save();
    res.json(updatedCollector);
  } else {
    res.status(404);
    throw new Error("Collector not found");
  }
});

/**
 * @route   DELETE /api/schedule/:id
 * @desc    Delete a schedule (Admin only)
 * @access  Private/Admin
 * @returns {Object} - A JSON object confirming deletion
 */
const deleteCollector = asyncHandler(async (req, res) => {
  const collctor = await Collector.findByIdAndDelete(req.params.id);

  if (collctor) {
    res.status(200);
    res.json({ message: "Collector removed successfully!" });
  } else {
    res.status(404);
    throw new Error("Collector not found!");
  }
});

/**
 * @route   POST /api/collector/logout
 * @desc    Log out the current collector
 * @access  Private
 * @header  {String} Authorization - The bearer token of the collector (required)
 * @returns {Object} - A JSON object with a message confirming the logout
 * @throws  {401} If the user is not authenticated
 * @throws  {500} If a server error occurs
 */
const logoutCurrentCollector = asyncHandler(async (req, res) => {
  res.cookie("jwt_collector", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully!" });
});

export {
  createCollector,
  getAllCollectors,
  getCollectorsByWMA,
  updateCollector,
  deleteCollector,
  getCollectorById,
  loginCollector,
  getCurrentCollectorProfile,
  logoutCurrentCollector,
};
