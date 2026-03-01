const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const router = express.Router();
const mongoUrl = process.env.MONGODB_URL;

router.post("/breathing/complete", async (req, res) => {
  let client;
  try {
    const { email, feeling, sessionId } = req.body;

    client = await MongoClient.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db();
    await db.collection("breathing_logs").insertOne({
      email,
      feeling,
      sessionId: sessionId || null,
      completedAt: new Date().toISOString(),
      exercise: "box_breathing_4_4_4_4",
    });

    return res.json({ success: true, message: "Exercise logged" });
  } catch (err) {
    console.error("Breathing log error:", err);
    return res.status(500).json({ error: "Failed to log breathing exercise" });
  } finally {
    if (client) await client.close();
  }
});

module.exports = router;
