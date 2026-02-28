const axios = require("axios");
require("dotenv").config();

const endpoint = "https://odlu-ma8jnrto-northcentralus.openai.azure.com/";
const deployment = "gpt-4-04-14";
const apiVersion = "2024-12-01-preview";
const apiKey =
  "1d1zZFOvzVjDePwMu8dOugdYD28KsXUVzQqyWFgMDIfwAWlWXHc7JQQJ99BEACHrzpqXJ3w3AAAAACOGkkHl";

const baseMessages = [
  {
    role: "system",
    content:
      "You are a helpful mental health companion and a friend. Be warm, kind, and supportive. Keep your answers to max 300 characters.",
  },
];

async function QueryGPT(prompt) {
  const messages = [...baseMessages, { role: "user", content: prompt }];

  try {
    const url = `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const response = await axios.post(
      url,
      {
        messages,
        temperature: 1.0,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        max_tokens: 300,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );

    const reply = response.data.choices[0].message.content.trim();
    console.log("Response from Azure OpenAI:", reply);
    return reply;
  } catch (error) {
    console.error(
      "Error from Azure OpenAI:",
      error.response?.data || error.message
    );
    return "Oops! Something went wrong with Azure OpenAI.";
  }
}

module.exports = QueryGPT;
