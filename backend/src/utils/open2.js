const axios = require("axios");
const { MongoClient } = require("mongodb");
require("dotenv").config();

// Azure OpenAI settings
const endpoint = "https://odlu-ma8jnrto-northcentralus.openai.azure.com/";
const deployment = "gpt-4-04-14";
const apiVersion = "2024-12-01-preview";
const apiKey =
  "1d1zZFOvzVjDePwMu8dOugdYD28KsXUVzQqyWFgMDIfwAWlWXHc7JQQJ99BEACHrzpqXJ3w3AAAAACOGkkHl";

const mongoUrl = process.env.MONGODB_URL;
let running_message = "";

async function callAzureChat(messages, max_tokens = 300) {
  const url = `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  const response = await axios.post(
    url,
    {
      messages,
      temperature: 0.7,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      max_tokens: max_tokens,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
    }
  );

  return response.data.choices[0].message.content.trim();
}

async function AnalyzeEmotion(prompt) {
  running_message += prompt + "\n";

  const emotionMessages = [
    {
      role: "system",
      content:
        'You are an emotion analysis model. Analyze the prompt and reply STRICTLY as JSON in the following format:\n{\n  "sentiment_score": float (-1.0 to 1.0),\n  "emotion_category": one of ["Happy","Sad","Neutral","Anxious","Angry"],\n  "emotion_intensity": integer (1 to 10)\n}',
    },
    {
      role: "user",
      content: `Analyze the following user entry:\n"${prompt}"`,
    },
  ];

  let responseText = "";
  let parsed;
  let entry;
  let client;

  try {
    // Get emotion analysis from Azure OpenAI
    responseText = await callAzureChat(emotionMessages);
    responseText = responseText.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(responseText);

    entry = {
      ...parsed,
      timestamp: new Date().toISOString(),
    };

    // Insert into MongoDB
    client = await MongoClient.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db();
    await db.collection("emotion_logs").insertOne(entry);
    console.log("Inserted into emotion_logs:", entry);

    // If intense emotion, generate journal summary
    if (parsed.emotion_intensity > 7) {
      const summaryMessages = [
        {
          role: "system",
          content:
            "You are a thoughtful mental health companion. Summarize the following conversation in 2-3 sentences, highlight feelings and offer gentle support.",
        },
        {
          role: "user",
          content: running_message,
        },
      ];

      const summaryText = await callAzureChat(summaryMessages, 200);

      const journalEntry = {
        summary: summaryText,
        timestamp: new Date().toISOString(),
        latest_emotion_category: parsed.emotion_category,
        latest_emotion_intensity: parsed.emotion_intensity,
      };
      await db.collection("journal").insertOne(journalEntry);
      console.log("Inserted into journal:", journalEntry);
    }

    return entry;
  } catch (err) {
    console.error("AnalyzeEmotion error:", err.message, "raw:", responseText);
    return null;
  } finally {
    if (client) await client.close();
  }
}

module.exports = AnalyzeEmotion;
