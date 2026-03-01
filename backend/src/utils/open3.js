require("dotenv").config();
const { chatCompletion } = require("./mistral");
const { MongoClient } = require("mongodb");

const mongoUrl = process.env.MONGODB_URL;

async function detectExtremeRisk(userMessage, sessionId) {
  const systemPrompt = `
You are a mental health crisis classifier. Analyze the user message for signs of self-harm, suicidal ideation, or extreme distress.

Classify the risk level as one of: NONE, LOW, MEDIUM, HIGH, CRITICAL

Guidelines:
- NONE: Normal conversation, no risk indicators
- LOW: Mild expressions of sadness or frustration, "feeling down"
- MEDIUM: Persistent hopelessness, isolation, but no immediate danger
- HIGH: Expressions of wanting to give up, feeling like a burden, indirect self-harm references
- CRITICAL: Explicit suicidal ideation, self-harm plans, immediate danger

Respond STRICTLY as JSON:
{"risk_level": "NONE|LOW|MEDIUM|HIGH|CRITICAL", "confidence": 0.0-1.0, "reasoning": "brief explanation"}
  `.trim();

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Message: ${userMessage}` },
  ];

  let client;
  try {
    const result = await chatCompletion(messages, {
      model: "mistral-small-latest",
      temperature: 0,
      maxTokens: 100,
    });

    let parsed;
    try {
      const cleaned = result.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      const upper = result.toUpperCase();
      if (upper.includes("CRITICAL")) parsed = { risk_level: "CRITICAL", confidence: 0.5, reasoning: result };
      else if (upper.includes("HIGH")) parsed = { risk_level: "HIGH", confidence: 0.5, reasoning: result };
      else if (upper.includes("RISK")) parsed = { risk_level: "HIGH", confidence: 0.5, reasoning: result };
      else parsed = { risk_level: "NONE", confidence: 0.5, reasoning: result };
    }

    console.log("Crisis detection result:", parsed);

    if (["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(parsed.risk_level)) {
      try {
        client = await MongoClient.connect(mongoUrl, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        const db = client.db();
        await db.collection("crisis_logs").insertOne({
          sessionId: sessionId || null,
          message: userMessage,
          risk_level: parsed.risk_level,
          confidence: parsed.confidence,
          reasoning: parsed.reasoning,
          escalated: parsed.risk_level === "CRITICAL" || (parsed.risk_level === "HIGH" && parsed.confidence >= 0.85),
          timestamp: new Date().toISOString(),
        });
      } catch (logErr) {
        console.error("Failed to log crisis event:", logErr);
      }
    }

    const shouldEscalate =
      parsed.risk_level === "CRITICAL" ||
      (parsed.risk_level === "HIGH" && parsed.confidence >= 0.85);

    if (shouldEscalate) {
      try {
        const accountSid = "ACb742010e2bc7d223a4d4dae884cf3c31";
        const authToken = "005e309e53548504b8d923229963ddaa";
        const twilioClient = require("twilio")(accountSid, authToken);

        twilioClient.calls.create({
          url: "http://demo.twilio.com/docs/voice.xml",
          to: "+16025743772",
          from: "+18885520964",
        });
        twilioClient.calls.create({
          url: "http://demo.twilio.com/docs/voice.xml",
          to: "+16023189382",
          from: "+18885520964",
        });
        console.log("Emergency call triggered for", parsed.risk_level, "confidence:", parsed.confidence);
      } catch (twilioErr) {
        console.error("Twilio call failed:", twilioErr);
      }
    }

    const isRisk = ["HIGH", "CRITICAL"].includes(parsed.risk_level) ? 1 : 0;
    return {
      isRisk,
      risk_level: parsed.risk_level,
      confidence: parsed.confidence,
      reasoning: parsed.reasoning,
    };
  } catch (err) {
    console.error("Error during crisis detection:", err);
    return { isRisk: 0, risk_level: "NONE", confidence: 0, reasoning: "Error in detection" };
  } finally {
    if (client) await client.close();
  }
}

module.exports = detectExtremeRisk;
