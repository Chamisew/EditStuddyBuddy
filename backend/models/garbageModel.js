import mongoose from "mongoose";

const garbageSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Reference to the User who made the request
    },
    address: {
      type: String,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Recyclable", "Non-Recyclable"],
    },
    // Free-text description / typing area for waste details
    wasteDetails: {
      type: String,
      default: "",
    },
    area: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Area", // Reference to the Area where the garbage will be collected
    },
    weight: {
      type: Number,
      default: 0,
    },
    // Array of image URLs uploaded by the user for the garbage request
    images: [{ type: String }],
    qrToken: {
      type: String,
      required: false,
    },
    qrGeneratedAt: {
      type: Date,
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collector",
    },
    collectedAt: {
      type: Date,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
    status: {
      type: String,
      enum: ["Pending", "Scheduled", "Collected", "In Progress", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Garbage = mongoose.model("Garbage", garbageSchema);

export default Garbage;
