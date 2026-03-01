const { chatCompletion } = require("./mistral");

const baseMessages = [
  {
    role: "system",
    content:
      "You are a helpful mental health companion and a friend. Be warm, kind, and supportive. Keep your answers to max 300 characters.",
  },
];

async function QueryGPT(prompt, language) {
  const systemMsg = language
    ? [{ ...baseMessages[0], content: baseMessages[0].content + ` Respond in ${language}.` }]
    : baseMessages;

  const messages = [...systemMsg, { role: "user", content: prompt }];

  try {
    const reply = await chatCompletion(messages, {
      temperature: 1.0,
      maxTokens: 300,
    });
    console.log("Response from Mistral:", reply);
    return reply;
  } catch (error) {
    console.error("Error from Mistral:", error.message);
    return "Oops! Something went wrong.";
  }
}

module.exports = QueryGPT;
