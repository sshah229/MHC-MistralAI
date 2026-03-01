const express = require("express");
const { orchestrate, orchestrateStream } = require("../../utils/agents");
const query4 = require("../../utils/open4");
const router = express.Router();

router.post("/chatbot", async (req, res) => {
  try {
    const { message, email, language, facialEmotion } = req.body;
    if (!message || !email) {
      return res.status(400).json({ error: "Missing message or email" });
    }

    console.log("Chatbot request:", { email, message, language, facialEmotion });

    let enrichedMessage = message;
    if (facialEmotion) {
      enrichedMessage += `\n[System note: user's facial expression appears ${facialEmotion}]`;
    }

    const { sessionId } = req.body;
    const result = await orchestrate(enrichedMessage, email, language, sessionId);

    const key = result.sentiment;
    console.log("Agent:", result.agentName, "Sentiment:", key, "Answer:", result.answer);

    return res.json({
      answer: result.answer,
      sentiment: result.sentiment,
      agent: result.agent,
      agentName: result.agentName,
      action: result.action || null,
    });
  } catch (err) {
    console.error("Chatbot route error:", err);
    return res.status(500).json({ error: "Chatbot failed" });
  }
});

router.post("/chatbot/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const { message, email, language, facialEmotion, sessionId } = req.body;
    if (!message || !email) {
      send("error", { error: "Missing message or email" });
      return res.end();
    }

    let enrichedMessage = message;
    if (facialEmotion) {
      enrichedMessage += `\n[System note: user's facial expression appears ${facialEmotion}]`;
    }

    const result = await orchestrateStream(
      enrichedMessage,
      email,
      language,
      sessionId,
      (chunk) => send("chunk", { text: chunk })
    );

    send("meta", {
      agent: result.agent,
      agentName: result.agentName,
      sentiment: result.sentiment,
      action: result.action || null,
    });
    send("done", {});
  } catch (err) {
    console.error("Stream chatbot error:", err);
    send("error", { error: "Chatbot streaming failed" });
  }
  res.end();
});

router.post("/diagnose", async (req, res) => {
  try {
    const diagnosis = await query4();
    if (!diagnosis) {
      return res.status(500).json({ error: "Diagnosis failed" });
    }

    console.log("Diagnosis result:", diagnosis);
    return res.json({ diagnosis });
  } catch (err) {
    console.error("Diagnosis route error:", err);
    return res.status(500).json({ error: "Diagnosis failed" });
  }
});

module.exports = router;
