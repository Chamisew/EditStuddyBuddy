import mongoose from "mongoose";

const collectorSchema = new mongoose.Schema({
  wmaId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "WMA", // Reference to the Wast management authority who manage the collectors
  },
  truckNumber: {
    type: String,
    required: true,
    unique: true,
  },
  collectorName: {
    type: String,
    required: true,
  },
  collectorNIC: {
    type: String,
    required: true,
    unique: true,
  },
  contactNo: {
    type: String,
    required: true,
    unique: true,
  },
  statusOfCollector: {
    type: String,
    required: true,
    enum: ["Available", "Not-Available"],
  },
});

const Collector = mongoose.model("Collector", collectorSchema);

export default Collector;
