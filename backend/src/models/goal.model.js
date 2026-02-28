const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true }, // drop enum for flexibility
    frequency: { type: Number, required: true }, // in minutes
    lastCompleted: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);
