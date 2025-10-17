import mongoose from 'mongoose';

const binSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    currentLevel: { type: Number, required: true, default: 0 },
      area: { type: mongoose.Schema.Types.ObjectId, ref: 'Area' },
    address: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isUrgent: { type: Boolean, default: false },
    wmaId: { type: mongoose.Schema.Types.ObjectId, ref: 'WMA' },
    // Mark when WMA forwards an urgent bin to admin for further action
    forwardedToAdmin: { type: Boolean, default: false },
    forwardedAt: { type: Date },
    // Link to a schedule created by admin for this bin (if any)
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', default: null },
  },
  { timestamps: true }
);

// Virtual for percentage filled
binSchema.virtual('percentageFilled').get(function () {
  if (!this.capacity) return 0;
  return Math.min(100, Math.round((this.currentLevel / this.capacity) * 100));
});

binSchema.set('toJSON', { virtuals: true });
binSchema.set('toObject', { virtuals: true });

const Bin = mongoose.model('Bin', binSchema);
export default Bin;
