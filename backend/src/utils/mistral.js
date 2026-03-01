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

async function* chatCompletionStream(messages, options = {}) {
  const stream = await client.chat.stream({
    model: options.model || "mistral-large-latest",
    messages,
    temperature: options.temperature ?? 0.7,
    maxTokens: options.maxTokens ?? 300,
  });
  for await (const event of stream) {
    const content = event.data?.choices?.[0]?.delta?.content;
    if (content) yield content;
  }
}

module.exports = { client, chatCompletion, chatCompletionStream };
