import WMA from "../models/wmaModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import { generateToken, generateWMAToken } from "../utils/createToken.js";

/**
 * @route   POST /api/wmas
 * @desc    Create a new wma
 * @access  Public
 * @param   {String} name - The name of the wma (required)
 * @param   {String} email - The email of the wma (required)
 * @param   {String} password - The password for the wma (required)
 * @returns {Object} - A JSON object containing the newly created wma data
 * @throws  {400} If the name, email, or password is missing or invalid
 * @throws  {409} If the email is already in use
 * @throws  {500} If a server error occurs
 */
const createWMA = asyncHandler(async (req, res) => {
  const { wmaname, address, contact, profileImage, authNumber, email, password } =
    req.body;

  // Check the body has necessary attributes
  if (!wmaname || !address || !contact || !authNumber || !email || !password) {
    throw new Error("Please fill all the inputs!!!");
  }

  // Check the wma if already exist
  const wmaExists = await WMA.findOne({ email });

  if (wmaExists) {
    res.status(400).send("WMA already exists!!!");
  }

  // Encypting the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Creating a wma
  const newWMA = new WMA({
    wmaname,
    address,
    contact,
    profileImage,
    authNumber,
    email,
    password: hashedPassword,
  });

  try {
    await newWMA.save();
    generateWMAToken(res, newWMA._id);

    res.status(201).json({
      _id: newWMA._id,
      wmaname: newWMA.wmaname,
      address: newWMA.address,
      contact: newWMA.contact,
      profileImage: newWMA.profileImage,
      authNumber: newWMA.authNumber,
      email: newWMA.email,
    });
  } catch (error) {
    res.status(400);
    throw new Error("Invalid wma data");
  }
});

/**
 * @route   POST /api/wmas/auth
 * @desc    Authenticate wma and get token
 * @access  Public
 * @param   {String} email - The email of the wma (required)
 * @param   {String} password - The password of the wma (required)
 * @returns {Object} - A JSON object containing the wma data and the authentication token
 * @throws  {400} If the email or password is missing or invalid
 * @throws  {401} If the email or password is incorrect
 * @throws  {500} If a server error occurs
 */
const loginWMA = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if wma exists
  const existingWMA = await WMA.findOne({ email });

  if (existingWMA) {
    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, existingWMA.password);

    if (isPasswordValid) {
      // Generate token if the wma is valid
      const token = generateWMAToken(res, existingWMA._id);

      res.status(201).json({
        _id: existingWMA._id,
        wmaname: existingWMA.wmaname,
        address: existingWMA.address,
        contact: existingWMA.contact,
        profileImage: existingWMA.profileImage,
        authNumber: existingWMA.authNumber,
        email: existingWMA.email,
        token: token,
      });
    } else {
      // Send error response for incorrect password
      res.status(401);
      throw new Error("Invalid password.");
    }
  } else {
    // Send error response if wma is not found
    res.status(404);
    throw new Error("WMA not found.");
  }
});

/**
 * @route   POST /api/wmas/logout
 * @desc    Log out the current wma
 * @access  Private
 * @header  {String} Authorization - The bearer token of the wma (required)
 * @returns {Object} - A JSON object with a message confirming the logout
 * @throws  {401} If the wma is not authenticated
 * @throws  {500} If a server error occurs
 */
const logoutCurrentWMA = asyncHandler(async (req, res) => {
  res.cookie("jwt_wma", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully!" });
});

/**
 * @route   GET /api/wmas
 * @desc    Retrieve a list of all wmas
 * @access  Private
 * @header  {String} Authorization - The bearer token of the wma (required)
 * @returns {Array} - A JSON array containing wma objects
 * @throws  {401} If the wma is not authenticated
 * @throws  {500} If a server error occurs
 */
const getAllWMAs = asyncHandler(async (req, res) => {
  const wmas = await WMA.find({});
  res.json(wmas);
});

/**
 * @route   GET /api/wmas/profile
 * @desc    Retrieve the current wma's profile
 * @access  Private
 * @header  {String} Authorization - The bearer token of the wma (required)
 * @returns {Object} - A JSON object containing the wma's profile data
 * @throws  {401} If the wma is not authenticated
 * @throws  {500} If a server error occurs
 */
const getCurrentWMAProfile = asyncHandler(async (req, res) => {
  const wma = await WMA.findById(req.wma._id);
  if (wma) {
    res.json({
      _id: wma._id,
      wmaname: wma.wmaname,
      address: wma.address,
      contact: wma.contact,
      profileImage: wma.profileImage,
      authNumber: wma.authNumber,
      email: wma.email,
    });
  } else {
    res.status(404);
    throw new Error("WMA not found!");
  }
});

/**
 * @route   PUT /api/wmas/profile
 * @desc    Update the current wma's profile
 * @access  Private
 * @header  {String} Authorization - The bearer token of the wma (required)
 * @body    {Object} profileData - The updated profile data
 * @returns {Object} - A JSON object containing the updated wma's profile data
 * @throws  {400} If the profile data is invalid
 * @throws  {401} If the wma is not authenticated
 * @throws  {500} If a server error occurs
 */

const updateCurrentWMAProfile = asyncHandler(async (req, res) => {
  console.log(req.body);
  const wma = await WMA.findById(req.wma._id);

  if (wma) {
    // Update profile fields (other than password)
    wma.wmaname = req.body.wmaname || wma.wmaname;
    wma.address = req.body.address || wma.address;
    wma.contact = req.body.contact || wma.contact;
    wma.profileImage = req.body.profileImage || wma.profileImage;
    wma.authNumber = req.body.authNumber || wma.authNumber;

    let passwordChanged = false;

    if (req.body.oldPassword && req.body.password && req.body.confirmPassword) {
      // Validate the current password
      const isMatch = await bcrypt.compare(req.body.oldPassword, wma.password);

      if (isMatch) {
        // Check if new password matches the confirm password
        if (req.body.password === req.body.confirmPassword) {
          // Encrypt and update the new password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(req.body.password, salt);

          wma.password = hashedPassword;
          passwordChanged = true;
        } else {
          res.status(400);
          throw new Error("New password and confirm password do not match.");
        }
      } else {
        res.status(401);
        throw new Error("Old password is incorrect.");
      }
    }

    const updatedWMA = await wma.save();

    res.json({
      _id: updatedWMA._id,
      wmaname: updatedWMA.wmaname,
      address: updatedWMA.address,
      contact: updatedWMA.contact,
      profileImage: updatedWMA.profileImage,
      authNumber: updatedWMA.authNumber,
      email: updatedWMA.email,
      message: passwordChanged
        ? "Password successfully changed!"
        : "Profile updated successfully!",
    });
  } else {
    res.status(404);
    throw new Error("WMA not found!");
  }
});


/**
 * @route   DELETE /api/wmas/:id
 * @desc    Delete a wma by ID
 * @access  Private
 * @header  {String} Authorization - The bearer token of the admin wma (required)
 * @param   {String} id - The ID of the wma to delete
 * @returns {Object} - A JSON object confirming deletion
 * @throws  {401} If the wma is not authenticated
 * @throws  {403} If the wma does not have permission to delete
 * @throws  {404} If the wma is not found
 * @throws  {500} If a server error occurs
 */

const deleteWMAById = asyncHandler(async (req, res) => {
  const wma = await WMA.findById(req.params.id);

  if (wma) {
    if (wma.isAdmin) {
      res.status(400);
      throw new Error("Cannot delete admin wma!");
    }

    await WMA.deleteOne({ _id: wma._id });
    res.json({ message: "WMA removed!" });
  } else {
    res.status(404);
    throw new Error("WMA not found!");
  }
});

/**
 * @route   GET /api/admin/wmas/:id
 * @desc    Retrieve a wma by ID (Admin only)
 * @access  Private
 * @header  {String} Authorization - The bearer token of the admin wma (required)
 * @param   {String} id - The ID of the wma to retrieve
 * @returns {Object} - A JSON object containing the wma's profile data
 * @throws  {401} If the wma is not authenticated
 * @throws  {403} If the wma is not an admin
 * @throws  {404} If the wma is not found
 * @throws  {500} If a server error occurs
 */

const getWMAById = asyncHandler(async (req, res) => {
  const wma = await WMA.findById(req.params.id).select("-password");

  if (wma) {
    res.json(wma);
  } else {
    res.status(404);
    throw new Error("WMA not found!");
  }
});

/**
 * @route   PUT /api/wmas/:id
 * @desc    Update a wma by ID (Admin only)
 * @access  Private
 * @header  {String} Authorization - The bearer token of the admin wma (required)
 * @param   {String} id - The ID of the wma to update
 * @body    {Object} wmaData - The updated wma data
 * @returns {Object} - A JSON object containing the updated wma's profile data
 * @throws  {400} If the wma data is invalid
 * @throws  {401} If the wma is not authenticated
 * @throws  {403} If the wma is not an admin
 * @throws  {404} If the wma is not found
 * @throws  {500} If a server error occurs
 */

const updateWMAById = asyncHandler(async (req, res) => {
  const wma = await WMA.findById(req.params.id);

  if (wma) {
    wma.wmaname = req.body.wmaname || wma.wmaname;
    wma.email = req.body.email || wma.email;

    const updatedWMA = await wma.save();

    res.json({
      _id: updatedWMA._id,
      wmaname: updatedWMA.wmaname,
      email: updatedWMA.email,
    });
  } else {
    res.status(404);
    throw new Error("WMA not found!");
  }
});

export {
    createWMA,
  loginWMA,
  logoutCurrentWMA,
  getAllWMAs,
  getCurrentWMAProfile,
  updateCurrentWMAProfile,
  deleteWMAById,
  getWMAById,
  updateWMAById,
};
