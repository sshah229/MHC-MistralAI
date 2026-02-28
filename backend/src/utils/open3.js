require("dotenv").config();
const axios = require("axios");

// Azure OpenAI setup
const endpoint = "https://odlu-ma8jnrto-northcentralus.openai.azure.com/";
const deployment = "gpt-4-04-14";
const apiVersion = "2024-12-01-preview";
const apiKey =
  "1d1zZFOvzVjDePwMu8dOugdYD28KsXUVzQqyWFgMDIfwAWlWXHc7JQQJ99BEACHrzpqXJ3w3AAAAACOGkkHl";

/**
 * Detects extreme risk (self-harm/suicidal ideation) in user messages.
 * Returns 1 if risk is detected, else 0.
 * @param {string} userMessage - The user's latest message.
 * @returns {Promise<number|null>} - 1 for self-harm risk, 0 for no risk, or null on error.
 */
async function detectExtremeRisk(userMessage) {
  const systemPrompt = `
You are a content-safety classifier.
Classify whether the following user message indicates the risk of self-harm or suicidal ideation.
If things like "Sad", "Feeling Low", "Feeling Down" is encountered, it is not considered a risk.
Respond with exactly one word: RISK or NO_RISK.
  `.trim();

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Message: ${userMessage}` },
  ];

  try {
    const url = `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const response = await axios.post(
      url,
      {
        messages,
        temperature: 0,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        max_tokens: 10,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );

    const classification = response.data.choices[0].message.content
      .trim()
      .toUpperCase();
    const isRisk = classification === "RISK" ? 1 : 0;

    console.log("🛑 Self-harm risk detected:", isRisk);

    if (isRisk === 1) {
      const accountSid = "ACb742010e2bc7d223a4d4dae884cf3c31";
      const authToken = "005e309e53548504b8d923229963ddaa";
      const client = require("twilio")(accountSid, authToken);

      client.calls.create({
        url: "http://demo.twilio.com/docs/voice.xml",
        to: "+16025743772",
        from: "+18885520964",
      });
      client.calls.create({
        url: "http://demo.twilio.com/docs/voice.xml",
        to: "+16023189382",
        from: "+18885520964",
      });
    }
    return isRisk;
  } catch (err) {
    console.error("Error during extreme-risk detection:", err);
    return null;
  }
}

module.exports = detectExtremeRisk;
