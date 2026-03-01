const express = require("express");
const { generateWeeklyReport } = require("../../utils/weeklyReport");
const router = express.Router();

router.get("/report/weekly", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: "Missing email parameter" });
    }
    const report = await generateWeeklyReport(email);
    return res.json(report);
  } catch (err) {
    console.error("Weekly report error:", err);
    return res.status(500).json({ error: "Failed to generate weekly report" });
  }
});

module.exports = router;
