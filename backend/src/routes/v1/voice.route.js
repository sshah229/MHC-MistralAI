const express = require("express");
const { textToSpeechElevenLabs } = require("../../utils/elevenlabs");
const fs = require("fs");
const path = require("path");
const router = express.Router();

router.post("/voice/speak", async (req, res) => {
  try {
    const { text, voice_id } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }

    const audioBuffer = await textToSpeechElevenLabs(text, voice_id);

    const randomStr = Math.random().toString(36).slice(2, 7);
    const filename = `speech-${randomStr}.mp3`;
    const publicDir = path.join(__dirname, "../../public");

    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, filename), audioBuffer);

    return res.json({ filename });
  } catch (err) {
    console.error("ElevenLabs TTS error:", err.message);
    return res.status(500).json({ error: "Voice synthesis failed" });
  }
});

module.exports = router;
