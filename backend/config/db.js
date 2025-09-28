import mongoose from "mongoose";

let isConnected = false; // This flag will track the connection status

/**
 * Connects to the MongoDB database using the connection string specified in the environment variable MONGO_URI.
 * Logs a success message upon successful connection.
 * Logs an error message and exits the process with a status code of 1 if the connection fails.
 * Ensures that only one instance of the connection is created (Singleton pattern).
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} A promise that resolves when the connection is successful.
 */
const connectDB = async () => {
  if (isConnected) {
    console.log("MongoDB connection already established");
    return;
  }

  const uri = process.env.MONGO_URI;

  // Debugging helper: show whether MONGO_URI is present
  if (!uri) {
    console.error("ERROR: MONGO_URI is not defined. Make sure you have a .env with MONGO_URI set and that dotenv.config() is called before connectDB().");
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      // Recommended options for Mongoose 6+ are defaulted; leaving object for clarity
    });
    isConnected = true;
    console.log(`Successfully connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
