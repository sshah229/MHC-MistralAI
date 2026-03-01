const { MongoClient } = require("mongodb");
const { chatCompletion } = require("./mistral");
require("dotenv").config();

const mongoUrl = process.env.MONGODB_URL;

async function generateWeeklyReport(email) {
  let client;
  try {
    client = await MongoClient.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db();

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const emotionLogs = await db
      .collection("emotion_logs")
      .find({ timestamp: { $gte: oneWeekAgo } })
      .sort({ timestamp: 1 })
      .toArray();

    const journalEntries = await db
      .collection("journal")
      .find({ timestamp: { $gte: oneWeekAgo } })
      .sort({ timestamp: 1 })
      .toArray();

    const emotionCounts = {};
    let totalIntensity = 0;
    emotionLogs.forEach((log) => {
      emotionCounts[log.emotion_category] = (emotionCounts[log.emotion_category] || 0) + 1;
      totalIntensity += log.emotion_intensity || 0;
    });

    const avgIntensity = emotionLogs.length > 0 ? (totalIntensity / emotionLogs.length).toFixed(1) : 0;

    const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];

    const journalSummaries = journalEntries.map((j) => j.summary).filter(Boolean);

    const prompt = `
You are a compassionate mental health companion generating a weekly soul report.

Here is the user's data for the past 7 days:
- Total emotion logs: ${emotionLogs.length}
- Emotion breakdown: ${JSON.stringify(emotionCounts)}
- Average emotion intensity: ${avgIntensity}/10
- Most frequent emotion: ${topEmotion ? topEmotion[0] : "None"} (${topEmotion ? topEmotion[1] : 0} times)
- Journal entries this week: ${journalSummaries.length}
- Journal summaries: ${journalSummaries.slice(0, 5).join(" | ")}

Generate a response STRICTLY as JSON:
{
  "headline": "One-sentence summary of the week",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "affirmations": ["affirmation 1", "affirmation 2", "affirmation 3"],
  "tip": "One actionable wellness tip for next week"
}
`;

    const result = await chatCompletion(
      [
        { role: "system", content: "You are a mental health report generator. Respond only with valid JSON." },
        { role: "user", content: prompt },
      ],
      { maxTokens: 500, temperature: 0.7 }
    );

    let parsed;
    try {
      const cleaned = result.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        headline: result.slice(0, 100),
        insights: [],
        affirmations: [],
        tip: "",
      };
    }

    return {
      ...parsed,
      stats: {
        totalLogs: emotionLogs.length,
        emotionCounts,
        avgIntensity: parseFloat(avgIntensity),
        topEmotion: topEmotion ? topEmotion[0] : null,
        topEmotionCount: topEmotion ? topEmotion[1] : 0,
        journalCount: journalEntries.length,
      },
      emotionTimeline: emotionLogs.map((l) => ({
        category: l.emotion_category,
        intensity: l.emotion_intensity,
        timestamp: l.timestamp,
      })),
    };
  } finally {
    if (client) await client.close();
  }
}

module.exports = { generateWeeklyReport };
