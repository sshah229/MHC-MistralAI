const express = require("express");
const Session = require("../../models/session.model");
const { chatCompletion } = require("../../utils/mistral");
const router = express.Router();

router.get("/session/:sessionId/mood-journey", async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.sessionId });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    return res.json({
      sessionId: session.sessionId,
      moodTimeline: session.moodTimeline,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
    });
  } catch (err) {
    console.error("Mood journey error:", err);
    return res.status(500).json({ error: "Failed to get mood journey" });
  }
});

router.post("/session/end", async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const conversationText = session.messages
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const moodSummary = session.moodTimeline
      .map((m) => `${m.emotion_category} (${m.emotion_intensity}/10)`)
      .join(" -> ");

    const summary = await chatCompletion([
      {
        role: "system",
        content:
          "Summarize this therapy session in 2-3 sentences. Highlight the emotional arc and key themes discussed. Be warm and encouraging.",
      },
      {
        role: "user",
        content: `Conversation:\n${conversationText}\n\nMood arc: ${moodSummary}`,
      },
    ], { maxTokens: 200 });

    session.endedAt = new Date();
    session.active = false;
    session.summary = summary;
    await session.save();

    return res.json({
      sessionId: session.sessionId,
      summary,
      moodTimeline: session.moodTimeline,
    });
  } catch (err) {
    console.error("Session end error:", err);
    return res.status(500).json({ error: "Failed to end session" });
  }
});

router.post("/session/start", async (req, res) => {
  try {
    const { userId } = req.body;
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const session = await Session.create({
      sessionId,
      userId,
      messages: [],
      moodTimeline: [],
    });
    return res.json({ sessionId: session.sessionId });
  } catch (err) {
    console.error("Session start error:", err);
    return res.status(500).json({ error: "Failed to start session" });
  }
});

module.exports = router;
