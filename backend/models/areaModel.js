import mongoose from "mongoose";

const areaSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["flat", "weightBased"], // Enumerated values
    },
    rate: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Area = mongoose.model("Area", areaSchema);

export default Area;
