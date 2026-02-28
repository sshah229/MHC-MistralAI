// routes/emotions.js
const express = require("express");
const { MongoClient } = require("mongodb");
const QueryGPT = require("../../utils/open");  // open.js wrapper
require("dotenv").config();

const router = express.Router();
const mongoUrl = process.env.MONGODB_URL;

// GET all emotion logs
router.get("/emotions", async (req, res) => {
  let client;
  try {
    client = await MongoClient.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db();
    const logs = await db
      .collection("emotion_logs")
      .find({})
      .sort({ timestamp: 1 })
      .toArray();
    res.json(logs);
  } catch (err) {
    console.error("Error fetching emotions:", err);
    res.status(500).json({ error: "Failed to fetch emotion logs." });
  } finally {
    if (client) client.close();
  }
});

// GET summary for a given range (30m, week, month)
router.get("/emotions/summary", async (req, res) => {
  const { range = "30m" } = req.query;
  const now = new Date();
  let threshold;
  if (range === "30m") {
    threshold = new Date(now.getTime() - 30 * 60 * 1000);
  } else if (range === "week") {
    threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else {
    threshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  let client;
  try {
    client = await MongoClient.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db();
    const logs = await db
      .collection("emotion_logs")
      .find({ timestamp: { $gte: threshold.toISOString() } })
      .sort({ timestamp: 1 })
      .toArray();

    const prompt = `
I’m going to give you a list of user emotion logs from the last ${range} (each entry has {sentiment_score, emotion_category, emotion_intensity, timestamp}).
1) In one sentence, summarize how the user was feeling or any unusual pattern you notice.
2) In one sentence, give a brief tip or comment to help them.
Output exactly two sentences.
Here are the logs:
${JSON.stringify(logs, null, 2)}
`;
    const summary = await QueryGPT(prompt);
    return res.json({ summary: summary.trim() });
  } catch (err) {
    console.error("Error in /emotions/summary:", err);
    return res.status(500).json({ error: "Could not generate summary." });
  } finally {
    if (client) client.close();
  }
});

module.exports = router;
