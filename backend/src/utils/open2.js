const { chatCompletion } = require("./mistral");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const mongoUrl = process.env.MONGODB_URL;
let running_message = "";

async function AnalyzeEmotion(prompt, email) {
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
    responseText = await chatCompletion(emotionMessages, { temperature: 0.3 });
    responseText = responseText.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(responseText);

    entry = {
      ...parsed,
      email: email || null,
      timestamp: new Date().toISOString(),
    };

    client = await MongoClient.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db();
    await db.collection("emotion_logs").insertOne(entry);
    console.log("Inserted into emotion_logs:", entry);

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

      const summaryText = await chatCompletion(summaryMessages, { maxTokens: 200 });

      const journalEntry = {
        summary: summaryText,
        email: email || null,
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
