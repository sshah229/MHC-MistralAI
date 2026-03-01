const { chatCompletion } = require("./mistral");
const detectExtremeRisk = require("./open3");
const AnalyzeEmotion = require("./open2");
const Session = require("../models/session.model");

const AGENT_PROMPTS = {
  listener: {
    name: "The Listener",
    system: `You are "The Listener", a deeply empathetic mental health companion. Your role:
- Validate the user's feelings without judgment
- Reflect back what you hear them saying
- Never give unsolicited advice
- Use warm, gentle language
- Acknowledge their courage in sharing
- Keep responses under 300 characters
You never judge. You only listen and validate.`,
  },
  coach: {
    name: "The Coach",
    system: `You are "The Coach", a supportive CBT-based mental health guide. Your role:
- Suggest practical coping strategies based on Cognitive Behavioral Therapy
- Help reframe negative thought patterns
- Offer actionable exercises (breathing, journaling, grounding)
- Be encouraging and solution-oriented
- Keep responses under 300 characters
You help the user take constructive steps forward.`,
  },
  guardian: {
    name: "The Guardian",
    system: `You are "The Guardian", a crisis-aware safety monitor. Your role:
- Provide calm, reassuring responses during distress
- Share crisis resources (988 Suicide & Crisis Lifeline, Crisis Text Line)
- Encourage the user to reach out to trusted people
- Never minimize their pain
- Keep responses under 300 characters
You protect and guide the user toward safety.`,
  },
};

async function selectAgent(message, emotionEntry) {
  const messages = [
    {
      role: "system",
      content: `You are a routing classifier. Based on the user message and their detected emotion, decide which agent should respond.
Reply with exactly one word: LISTENER or COACH.
- LISTENER: if the user is venting, expressing pain, sharing feelings, or needs validation
- COACH: if the user is seeking advice, coping strategies, asking "what should I do", or looking for actionable help`,
    },
    {
      role: "user",
      content: `Message: "${message}"\nDetected emotion: ${emotionEntry?.emotion_category || "unknown"} (intensity: ${emotionEntry?.emotion_intensity || "unknown"})`,
    },
  ];

  try {
    const result = await chatCompletion(messages, { temperature: 0, maxTokens: 10 });
    const choice = result.toUpperCase().trim();
    return choice === "COACH" ? "coach" : "listener";
  } catch {
    return "listener";
  }
}

async function buildMoodContext(session) {
  if (!session || session.moodTimeline.length === 0) return "";
  const recent = session.moodTimeline.slice(-5);
  const arc = recent.map((m) => `${m.emotion_category}(${m.emotion_intensity}/10)`).join(" -> ");
  const first = recent[0];
  const last = recent[recent.length - 1];

  let trend = "";
  if (first.emotion_intensity > last.emotion_intensity + 2) {
    trend = "The user seems to be feeling calmer now compared to earlier.";
  } else if (last.emotion_intensity > first.emotion_intensity + 2) {
    trend = "The user's distress seems to be increasing.";
  }

  return `\n[Emotional arc this session: ${arc}. ${trend}]`;
}

async function orchestrate(message, email, language, sessionId) {
  const emotionEntry = await AnalyzeEmotion(message, email);

  let session = null;
  if (sessionId) {
    session = await Session.findOne({ sessionId });
    if (session) {
      session.messages.push({
        role: "user",
        content: message,
        emotion: emotionEntry ? {
          category: emotionEntry.emotion_category,
          intensity: emotionEntry.emotion_intensity,
          score: emotionEntry.sentiment_score,
        } : undefined,
      });
      if (emotionEntry) {
        session.moodTimeline.push({
          emotion_category: emotionEntry.emotion_category,
          emotion_intensity: emotionEntry.emotion_intensity,
          sentiment_score: emotionEntry.sentiment_score,
        });
      }
    }
  }

  const moodContext = await buildMoodContext(session);

  const crisisResult = await detectExtremeRisk(message, sessionId);
  if (crisisResult.isRisk === 1) {
    const guardianMessages = [
      { role: "system", content: AGENT_PROMPTS.guardian.system + moodContext + (language ? ` Respond in ${language}.` : "") },
      { role: "user", content: message },
    ];
    const answer = await chatCompletion(guardianMessages, { maxTokens: 180 });

    if (session) {
      session.messages.push({ role: "assistant", content: answer, agent: "guardian" });
      await session.save();
    }

    return {
      answer,
      agent: "guardian",
      agentName: AGENT_PROMPTS.guardian.name,
      sentiment: emotionEntry?.emotion_category?.toLowerCase() || "neutral",
      emotionEntry,
      action: "breathing_exercise",
    };
  }

  const selectedAgent = await selectAgent(message, emotionEntry);
  const agentConfig = AGENT_PROMPTS[selectedAgent];

  const contextMessages = [];
  if (session && session.messages.length > 1) {
    const recentHistory = session.messages.slice(-6, -1);
    recentHistory.forEach((m) => {
      contextMessages.push({ role: m.role, content: m.content });
    });
  }

  const agentMessages = [
    { role: "system", content: agentConfig.system + moodContext + (language ? ` Respond in ${language}.` : "") },
    ...contextMessages,
    { role: "user", content: message },
  ];

  const answer = await chatCompletion(agentMessages, { temperature: 0.8, maxTokens: 180 });

  if (session) {
    session.messages.push({ role: "assistant", content: answer, agent: selectedAgent });
    await session.save();
  }

  return {
    answer,
    agent: selectedAgent,
    agentName: agentConfig.name,
    sentiment: emotionEntry?.emotion_category?.toLowerCase() || "neutral",
    emotionEntry,
  };
}

module.exports = { orchestrate, AGENT_PROMPTS };
