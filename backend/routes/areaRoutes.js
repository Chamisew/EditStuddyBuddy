import express from "express";
import {
  createArea,
  getAllAreas,
  getAreaById,
  updateArea,
  deleteArea,
} from "../controllers/areaController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Routes for creating a new area and getting all areas
router
  .route("/")
  .post(authenticate, authorizeAdmin, createArea) // Only admins can create areas
  .get(getAllAreas); // Public route to get all areas

// Route for getting, updating, and deleting a specific area by ID
router
  .route("/:id")
  .get(getAreaById) // Public route to get area by ID
  .put(authenticate, authorizeAdmin, updateArea) // Only admins can update an area
  .delete(authenticate, authorizeAdmin, deleteArea); // Only admins can delete an area

export default router;
