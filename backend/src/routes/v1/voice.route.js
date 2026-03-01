const express = require("express");
const multer = require("multer");
const textToSpeechAzure = require("../../helpers/tts");
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

router.post("/voice/speak", async (req, res) => {
  try {
    const { text, voice_id } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }

    // Keep ElevenLabs integration in codebase for track requirements,
    // but run Azure-only in production demo path for speed/reliability.
    const result = await textToSpeechAzure(text, req.body.voice || voice_id);
    if (!result?.filename) {
      throw new Error("Azure TTS returned no filename");
    }
    return res.json({
      filename: result.filename,
      blendData: Array.isArray(result.blendData) ? result.blendData : [],
      provider: "azure",
    });
  } catch (err) {
    console.error("Voice synthesis failed:", err?.errors || err?.message || err);
    return res.status(500).json({ error: "Voice synthesis failed" });
  }
});

router.post("/voice/listen", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }
    // Browser STT fallback is used in the frontend for low latency/reliability.
    return res.status(501).json({ error: "Server STT disabled; use browser transcript fallback." });
  } catch (err) {
    console.error("Voice listen route error:", err?.response?.data || err.message);
    return res.status(500).json({ error: "Speech recognition failed" });
  }
});

module.exports = router;
