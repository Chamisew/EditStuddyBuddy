import mongoose from "mongoose";

const scheduleSchema = mongoose.Schema(
  {
    wmaId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "WMA", // Reference to the Wast management authority who made the request
    },
    collectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collector" // Reference to the Collector who assing to the schedule
    },
    area: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Area" // Reference to the Area that schedule related to
    },
    date: {
      type: Date,
    },
    time: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: props => `${props.value} is not a valid time!`
      }
    },
    longitude: {
      type: Number,
    },
    latitude: {
      type: Number,
    },
    status: {
      type: String,
      required: true,
    },
    binId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bin'
    },
    garbageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Garbage',
    },
  },
  { timestamps: true }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;
