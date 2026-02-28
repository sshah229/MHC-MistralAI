// src/utils/diagnosePatient.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { MongoClient } = require("mongodb");
require("dotenv").config();

// Instantiate the Google Generative AI client using your API key from .env
const genAI = new GoogleGenerativeAI("AIzaSyD02kJ3dqI2k0v9hLbEfH-l0igviqq-S04");
const mongoUrl = process.env.MONGODB_URL;

/**
 * Analyze a patient's description and assign one diagnosis category.

 * @returns {Promise<string|null>} - The diagnosis category, or null on error.
 */
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

  // Construct a strict classification prompt
  const enhanced = `
Analyze the following patient description and choose exactly one diagnosis category from this list:
${categories.map((c) => `- ${c}`).join("\n")}



Respond with ONLY the exact category name (no additional text).
`;

  let diagnosis = null;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(enhanced);
    const raw = await result.response.text();
    const candidate = raw.trim();

    // Validate the response
    if (!categories.includes(candidate)) {
      throw new Error(`Received invalid category: ${candidate}`);
    }
    diagnosis = candidate;

    // Log to MongoDB
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
