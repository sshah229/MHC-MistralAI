const { Mistral } = require("@mistralai/mistralai");
require("dotenv").config();

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

async function chatCompletion(messages, options = {}) {
  const response = await client.chat.complete({
    model: options.model || "mistral-large-latest",
    messages,
    temperature: options.temperature ?? 0.7,
    maxTokens: options.maxTokens ?? 300,
  });
  return response.choices[0].message.content.trim();
}

module.exports = { client, chatCompletion };
