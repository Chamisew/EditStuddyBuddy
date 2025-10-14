import Transaction from "../models/transactionModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModel.js";

// @desc    Create a new transaction
// @route   POST /api/transactions
/**
 * Creates a new transaction for a user.
 *
 * @async
 * @function createTransaction
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.userID - The ID of the user.
 * @param {string} req.body.description - The description of the transaction.
 * @param {boolean} req.body.isRefund - Indicates if the transaction is a refund.
 * @param {boolean} req.body.isPaid - Indicates if the transaction is paid.
 * @param {number} req.body.amount - The amount of the transaction.
 * @param {Object} res - The response object.
 * @throws Will throw an error if the user is not found.
 * @throws Will throw an error if the transaction creation fails.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 */
const createTransaction = asyncHandler(async (req, res) => {
  const { userID, description, isRefund, isPaid, amount } = req.body;

  // console.log(`userID => `, req.body);
  // Find the user
  const user = await User.findById(userID);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const transaction = new Transaction({
    user: userID,
    description,
    isPaid,
    isRefund,
    amount,
  });

  try {
    // console.log(`transaction => `, transaction);
    const createdTransaction = await transaction.save();
    res.status(201).json(createdTransaction);
  } catch (error) {
    res.status(400);
    throw new Error("Transaction creation failed.");
  }
});

/**
 * Retrieves all transactions from the database, populates user details, and sorts them by creation date in descending order.
 *
 * @function getAllTransactions
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Returns a JSON response with the list of transactions.
 */
const getAllTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({})
    .populate("user", "name email") // Populate user details
    .sort({ createdAt: -1 });

  res.status(200).json(transactions);
});

/**
 * Get a transaction by its ID.
 *
 * This function retrieves a transaction from the database using the provided ID
 * and populates the user field with the user's name and email. If the transaction
 * is found, it returns the transaction data with a 200 status code. If not, it
 * returns a 404 status code with a "Transaction not found" message.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the transaction to retrieve.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */
const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (transaction) {
    res.status(200).json(transaction);
  } else {
    res.status(404).json({ message: "Transaction not found" });
  }
});

/**
 * Retrieves all transactions for a specific user.
 *
 * This function fetches all transactions associated with the authenticated user,
 * populates the user details, and sorts them by creation date in descending order.
 * If transactions are found, it returns them with a 200 status code. If no transactions
 * are found, it returns a 404 status code with a "No transactions found for this user" message.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */
const getTransactionsByUser = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id })
    .populate("user", "username email")
    .sort({ createdAt: -1 });

  // Diagnostic logging to help debug missing transactions for a user.
  // Log the authenticated user id and the number of transactions found.
  try {
    console.debug(`getTransactionsByUser: req.user._id=${req.user?._id}`);
    console.debug(`getTransactionsByUser: found ${transactions.length} transactions`);
  } catch (e) {
    // ignore logging errors
  }

  // Extra diagnostics: log total transactions count and a small sample to inspect stored user values
  try {
    const totalTx = await Transaction.countDocuments();
    console.debug(`getTransactionsByUser: total transactions in DB=${totalTx}`);
    const sample = await Transaction.find({}).limit(5).select("user description amount").lean();
    console.debug(`getTransactionsByUser: sample transactions=${JSON.stringify(sample)}`);
  } catch (e) {
    console.debug("getTransactionsByUser: error fetching sample transactions", e.message);
  }

  // Return transactions (may be empty) with 200 status to simplify frontend handling.
  res.status(200).json(transactions);
});

/**
 * Retrieves all transactions for a specific user by user ID.
 *
 * This function fetches all transactions associated with the provided user ID,
 * populates the user details, and sorts them by creation date in descending order.
 * If transactions are found, it returns them with a 200 status code. If no transactions
 * are found, it returns a 404 status code with a "No transactions found for this user" message.
 *
 * @param {Object} req - The request object, which should contain the user ID in the params.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */
const getTransactionsByUserId = asyncHandler(async (req, res) => {
  const userId = req.params.userId; // Get user ID from request parameters

  // Fetch transactions by user ID
  const transactions = await Transaction.find({ user: userId })
    .populate("user", "username email") // Populate user details if needed
    .sort({ createdAt: -1 }); // Sort transactions by createdAt in descending order


  // Diagnostic logging for troubleshooting
  try {
    console.debug(`getTransactionsByUserId: queried userId=${userId}`);
    console.debug(`getTransactionsByUserId: found ${transactions.length} transactions`);
  } catch (e) {
    // ignore logging errors
  }

  // Return transactions (may be empty) with 200 status.
  res.status(200).json(transactions);
});

/**
 * Updates a transaction's payment status.
 *
 * This function updates the payment status of a transaction identified by its ID.
 * If the transaction is found, it updates the `isPaid` field with the provided value
 * and saves the updated transaction. If the transaction is not found, it returns a
 * 404 status code with a "Transaction not found" message.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the transaction to update.
 * @param {Object} req.body - The body of the request.
 * @param {boolean} req.body.isPaid - The new payment status of the transaction.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */
const updateTransaction = asyncHandler(async (req, res) => {
  const { isPaid } = req.body;

  const transaction = await Transaction.findById(req.params.id);

  if (transaction) {
    transaction.isPaid = isPaid !== undefined ? isPaid : transaction.isPaid;

    const updatedTransaction = await transaction.save();
    res.status(200).json(updatedTransaction);
  } else {
    res.status(404).json({ message: "Transaction not found" });
  }
});

export {
  createTransaction,
  getAllTransactions,
  getTransactionsByUser,
  getTransactionsByUserId,
  getTransactionById,
  updateTransaction,
};
