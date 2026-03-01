const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  agent: { type: String },
  emotion: {
    category: String,
    intensity: Number,
    score: Number,
  },
  timestamp: { type: Date, default: Date.now },
});

const moodPointSchema = new mongoose.Schema({
  emotion_category: String,
  emotion_intensity: Number,
  sentiment_score: Number,
  timestamp: { type: Date, default: Date.now },
});

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  messages: [messageSchema],
  moodTimeline: [moodPointSchema],
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  summary: { type: String },
  active: { type: Boolean, default: true },
});

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
