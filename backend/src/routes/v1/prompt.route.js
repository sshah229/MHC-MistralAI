const express = require("express");
const twilio = require("twilio");
const User = require("../../models/user.model");

const router = express.Router();

router.post("/emergency", async (req, res) => {
  try {
    const { email, message, sessionId } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const toNumber = user.emergency1;
    if (!toNumber) {
      return res.status(422).json({ error: "Emergency contact 1 not configured for this user" });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;
    if (!accountSid || !authToken || !fromNumber) {
      return res.status(503).json({
        error: "Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER",
      });
    }

    const twilioClient = twilio(accountSid, authToken);
    const safeMessage = String(
      message || `${user.name || "A user"} triggered emergency assistance from Sakhi.`
    )
      .replace(/[<>&]/g, "")
      .slice(0, 280);

    const call = await twilioClient.calls.create({
      twiml: `<Response><Say voice="alice">Emergency alert from Sakhi. ${safeMessage}</Say></Response>`,
      to: toNumber,
      from: fromNumber,
    });

    return res.json({
      success: true,
      callSid: call.sid,
      status: call.status,
      to: toNumber,
      sessionId: sessionId || null,
    });
  } catch (err) {
    console.error("Emergency call route error:", err.message || err);
    return res.status(500).json({ error: "Emergency alert failed" });
  }
});

module.exports = router;