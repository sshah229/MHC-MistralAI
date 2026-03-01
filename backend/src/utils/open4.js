const { chatCompletion } = require("./mistral");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const mongoUrl = process.env.MONGODB_URL;

async function DiagnosePatient() {
  const categories = [
    "Depression",
    "Anxiety",
    "Bipolar Disorder",
    "PTSD",
    "OCD",
    "Schizophrenia",
    "Eating Disorders",
    "ADHD",
    "Autism Spectrum Disorder",
    "Substance Abuse",
  ];

  const messages = [
    {
      role: "system",
      content: `You are a mental health diagnostic classifier. Choose exactly one diagnosis category from this list:\n${categories.map((c) => `- ${c}`).join("\n")}\n\nRespond with ONLY the exact category name (no additional text).`,
    },
    {
      role: "user",
      content: "Analyze the patient's recent emotional logs and conversation history to determine the most likely diagnosis.",
    },
  ];

  let diagnosis = null;
  try {
    const raw = await chatCompletion(messages, { temperature: 0.3, maxTokens: 50 });
    const candidate = raw.trim();

    if (!categories.includes(candidate)) {
      throw new Error(`Received invalid category: ${candidate}`);
    }
    diagnosis = candidate;

    const entry = { diagnosis, timestamp: new Date().toISOString() };
    const client = await MongoClient.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.db().collection("diagnosis_logs").insertOne(entry);
    await client.close();

    console.log("Inserted diagnosis log:", entry);
    return diagnosis;
  } catch (err) {
    console.error("DiagnosePatient error:", err);
    return null;
  }
}

module.exports = DiagnosePatient;
