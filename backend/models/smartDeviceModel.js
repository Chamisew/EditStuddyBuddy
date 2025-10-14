import mongoose from "mongoose";

const smartDeviceSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["recyclable", "non-recyclable"],
    },
    area: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Distributed", "In Progress"],
      default: "Pending",
    },
    garbageStatus: {
      type: String,
      enum: ["Pending", "Collected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const SmartDevice = mongoose.model("SmartDevice", smartDeviceSchema);

export default SmartDevice;
