const express = require("express");
const multer = require("multer");
const { textToSpeechElevenLabs, speechToTextElevenLabs } = require("../../utils/elevenlabs");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

router.post("/voice/speak", async (req, res) => {
  try {
    const { text, voice_id } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }

    const { audioBuffer, blendData } = await textToSpeechElevenLabs(text, voice_id);

    const randomStr = Math.random().toString(36).slice(2, 7);
    const filename = `speech-${randomStr}.mp3`;
    const publicDir = path.join(__dirname, "../../public");

    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, filename), audioBuffer);

    return res.json({ filename, blendData });
  } catch (err) {
    console.error("ElevenLabs TTS error:", err.message);
    return res.status(500).json({ error: "Voice synthesis failed" });
  }
});

router.post("/voice/listen", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const languageCode = req.body.language_code || null;
    const result = await speechToTextElevenLabs(
      req.file.buffer,
      req.file.originalname,
      languageCode
    );

    return res.json({
      text: result.text || "",
      language_code: result.language_code || null,
      words: result.words || [],
    });
  } catch (err) {
    console.error("ElevenLabs STT error:", err?.response?.data || err.message);
    return res.status(500).json({ error: "Speech recognition failed" });
  }
});

module.exports = router;
