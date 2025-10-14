import mongoose from "mongoose";

const wmaSchema = mongoose.Schema(
  {
    wmaname: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      required: false,
    },
    authNumber: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const WMA = mongoose.model("WMA", wmaSchema);

export default WMA;
