var express = require("express");
var router = express.Router();
var textToSpeech = require("../../helpers/tts");

/* GET home page. */
router.post("", function (req, res, next) {
  if (!req.body?.text) {
    return res.status(400).json({ error: "Missing text" });
  }
  console.log(req.body.text);
  textToSpeech(req.body.text, req.body.voice)
    .then((result) => {
      if (!result?.filename) {
        return res.status(502).json({ error: "TTS fallback did not return audio" });
      }
      res.json(result);
    })
    .catch((err) => {
      console.error("Fallback /talk TTS failed:", err?.message || err);
      res.status(500).json({ error: "Fallback TTS failed" });
    });
});

module.exports = router;
