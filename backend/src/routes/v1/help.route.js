const express = require("express");

const router = express.Router();

router.post("/helpline", async (req, res) => {
  const user = req.body?.user || "there";
  res.send(`Hold Tight! ${user}, Help is on your way.`);
});

module.exports = router;