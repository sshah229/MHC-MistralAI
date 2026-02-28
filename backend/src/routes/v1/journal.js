// routes/journalOverview.js
const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const router = express.Router();
const mongoUrl = process.env.MONGODB_URL;

/**
 * GET /journal/dates
 * Returns an array of { date: 'YYYY-MM-DD', emotions: [<categories>] }
 */
router.get("/journal/dates", async (req, res) => {
  let client;
  try {
    client = await MongoClient.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db();

    // Fetch all emotion_logs
    const logs = await db
      .collection("emotion_logs")
      .find({})
      .project({ emotion_category: 1, timestamp: 1, _id: 0 })
      .toArray();

    // Group by date
    const grouped = logs.reduce((acc, { emotion_category, timestamp }) => {
      const date = timestamp.slice(0, 10); // 'YYYY-MM-DD'
      if (!acc[date]) acc[date] = new Set();
      acc[date].add(emotion_category);
      return acc;
    }, {});

    // Build result array, sort descending
    const result = Object.entries(grouped)
      .map(([date, set]) => ({
        date,
        emotions: Array.from(set),
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    res.json(result);
  } catch (err) {
    console.error("Error in GET /journal/dates:", err);
    res.status(500).json({ error: "Failed to fetch dates." });
  } finally {
    if (client) await client.close();
  }
});

/**
 * GET /journal/entries/:date
 * Returns all journal entries where timestamp starts with :date
 */
router.get("/journal/entries/:date", async (req, res) => {
  const { date } = req.params; // expecting 'YYYY-MM-DD'
  let client;
  try {
    client = await MongoClient.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db();

    const entries = await db
      .collection("journal")
      .find({ timestamp: { $regex: `^${date}` } })
      .sort({ timestamp: 1 })
      .toArray();

    res.json(entries);
  } catch (err) {
    console.error(`Error in GET /journal/entries/${date}:`, err);
    res.status(500).json({ error: "Failed to fetch journal entries for date." });
  } finally {
    if (client) await client.close();
  }
});

module.exports = router;
