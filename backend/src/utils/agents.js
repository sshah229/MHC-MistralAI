const { chatCompletion, chatCompletionStream } = require("./mistral");
const detectExtremeRisk = require("./open3");
const AnalyzeEmotion = require("./open2");
const Session = require("../models/session.model");

const SHARED_RULES = `
STRICT RULES (follow every single time):
- Never use emojis, ever.
- Keep your response 2-4 sentences. Be concise, direct, and to the point.
- Speak naturally like a real person talking to a friend, not like a chatbot.
- Do not repeat yourself or pad your response with filler words.
- If the user asks you to "switch" roles or talk to a different agent, let them know they can use the agent selector dropdown at the top right of the screen to choose between Sakhi, Sage, and Haven.
- Stay in character as your assigned role at all times. Do not pretend to be a different agent.`;

const AGENT_PROMPTS = {
  sakhi: {
    name: "Sakhi",
    system: `You are "Sakhi", a warm and caring companion. You are the user's trusted friend who listens without judgment. Your role:
- Validate the user's feelings and reflect back what you hear them saying
- Never give unsolicited advice unless asked
- Use warm, gentle, natural language -- like a close friend would
- Acknowledge their courage in opening up
${SHARED_RULES}`,
  },
  sage: {
    name: "Sage",
    system: `You are "Sage", a calm and wise guide. You help the user find clarity and take practical steps forward. Your role:
- Suggest practical coping strategies grounded in Cognitive Behavioral Therapy
- Help reframe negative thought patterns into healthier perspectives
- Offer actionable exercises when appropriate (breathing, journaling, grounding)
- Be encouraging and solution-oriented without being pushy
${SHARED_RULES}`,
  },
  haven: {
    name: "Haven",
    system: `You are "Haven", a steady and protective presence. You are there for the user in their most difficult moments. Your role:
- Provide calm, grounding reassurance during distress
- Share crisis resources naturally (988 Suicide & Crisis Lifeline, Crisis Text Line: text HOME to 741741)
- Gently encourage the user to reach out to someone they trust
- Never minimize their pain or rush them
${SHARED_RULES}`,
  },
};

const SAGE_KEYWORDS = /\b(what should i do|how do i|how can i|help me|advice|tips?|suggest|cope|strategy|steps?|plan|solution|fix|improve|manage|technique|exercise)\b/i;
const SAKHI_EMOTIONS = new Set(["sad", "angry", "anxious"]);

function selectAgent(message, emotionEntry) {
  if (SAGE_KEYWORDS.test(message)) return "sage";

  const category = (emotionEntry?.emotion_category || "").toLowerCase();
  const intensity = emotionEntry?.emotion_intensity || 0;

  if (SAKHI_EMOTIONS.has(category) && intensity >= 6) return "sakhi";
  if (intensity >= 7) return "sakhi";

  return "sakhi";
}

function buildMoodContext(session) {
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

async function orchestrate(message, email, language, sessionId, preferredAgent) {
  const [emotionEntry, session, crisisResult] = await Promise.all([
    AnalyzeEmotion(message, email),
    sessionId ? Session.findOne({ sessionId }) : Promise.resolve(null),
    detectExtremeRisk(message, sessionId),
  ]);

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

  const moodContext = buildMoodContext(session);

  if (crisisResult.isRisk === 1) {
    const havenMessages = [
      { role: "system", content: AGENT_PROMPTS.haven.system + moodContext + (language ? ` Respond in ${language}.` : "") },
      { role: "user", content: message },
    ];
    const answer = await chatCompletion(havenMessages, { maxTokens: 180 });

    if (session) {
      session.messages.push({ role: "assistant", content: answer, agent: "haven" });
      await session.save();
    }

    return {
      answer,
      agent: "haven",
      agentName: AGENT_PROMPTS.haven.name,
      sentiment: emotionEntry?.emotion_category?.toLowerCase() || "neutral",
      emotionEntry,
      action: "breathing_exercise",
    };
  }

  const selectedAgent = (preferredAgent && AGENT_PROMPTS[preferredAgent])
    ? preferredAgent
    : selectAgent(message, emotionEntry);
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

async function orchestrateStream(message, email, language, sessionId, onChunk, preferredAgent) {
  const [emotionEntry, crisisResult] = await Promise.all([
    AnalyzeEmotion(message, email),
    detectExtremeRisk(message, sessionId),
  ]);

  let session = null;
  if (sessionId) {
    session = await Session.findOne({ sessionId });
    if (session) {
      session.messages.push({
        role: "user",
        content: message,
        emotion: emotionEntry
          ? {
              category: emotionEntry.emotion_category,
              intensity: emotionEntry.emotion_intensity,
              score: emotionEntry.sentiment_score,
            }
          : undefined,
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

  if (crisisResult.isRisk === 1) {
    const havenMessages = [
      { role: "system", content: AGENT_PROMPTS.haven.system + moodContext + (language ? ` Respond in ${language}.` : "") },
      { role: "user", content: message },
    ];
    let fullText = "";
    for await (const chunk of chatCompletionStream(havenMessages, { maxTokens: 180 })) {
      fullText += chunk;
      onChunk(chunk);
    }

    if (session) {
      session.messages.push({ role: "assistant", content: fullText, agent: "haven" });
      await session.save();
    }

    return {
      answer: fullText,
      agent: "haven",
      agentName: AGENT_PROMPTS.haven.name,
      sentiment: emotionEntry?.emotion_category?.toLowerCase() || "neutral",
      emotionEntry,
      action: "breathing_exercise",
    };
  }

  const selectedAgent = (preferredAgent && AGENT_PROMPTS[preferredAgent])
    ? preferredAgent
    : selectAgent(message, emotionEntry);
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

  let fullText = "";
  for await (const chunk of chatCompletionStream(agentMessages, { temperature: 0.8, maxTokens: 180 })) {
    fullText += chunk;
    onChunk(chunk);
  }

  if (session) {
    session.messages.push({ role: "assistant", content: fullText, agent: selectedAgent });
    await session.save();
  }

  return {
    answer: fullText,
    agent: selectedAgent,
    agentName: agentConfig.name,
    sentiment: emotionEntry?.emotion_category?.toLowerCase() || "neutral",
    emotionEntry,
  };
}

module.exports = { orchestrate, orchestrateStream, AGENT_PROMPTS };
