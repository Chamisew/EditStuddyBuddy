import express from "express";

import {
  createTransaction,
  getAllTransactions,
  getTransactionsByUser,
  getTransactionById,
  getTransactionsByUserId,
  updateTransaction,
} from "../controllers/transactionController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

// Initialize the router
const router = express.Router();

// Route for creating a new transaction and getting all transactions
router
  .route("/")
  .post(createTransaction) // Create a new transaction
  .get(authenticate, authorizeAdmin, getAllTransactions); // Get all transactions (admin only)

// Route for getting transactions by user
router.route("/user").get(authenticate, getTransactionsByUser); // Get transactions for the authenticated user

// Route for getting transactions by user ID
router
  .route("/:userId")
  .get(authenticate, authorizeAdmin, getTransactionsByUserId); // Get transactions by user ID

// Route for getting, and updating a transaction by ID
router
  .route("/:id")
  .get(authenticate, getTransactionById) // Get a transaction by ID
  .put(authenticate, updateTransaction); // Update a transaction by ID

export default router;
