const axios = require("axios");
const FormData = require("form-data");
const blendShapeNames = require("../helpers/blendshapeNames");
require("dotenv").config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

const FPS = 60;

// Maps characters to ARKit-compatible mouth blendshape targets.
// Values are empirically tuned to approximate natural speech mouth shapes.
const VISEME_MAP = {
  // Open vowels
  a: { jawOpen: 0.7, mouthLowerDownLeft: 0.4, mouthLowerDownRight: 0.4, mouthUpperUpLeft: 0.15, mouthUpperUpRight: 0.15 },
  // Mid vowels
  e: { jawOpen: 0.35, mouthSmileLeft: 0.35, mouthSmileRight: 0.35, mouthStretchLeft: 0.2, mouthStretchRight: 0.2 },
  // Close vowels spread
  i: { jawOpen: 0.2, mouthSmileLeft: 0.5, mouthSmileRight: 0.5, mouthStretchLeft: 0.35, mouthStretchRight: 0.35 },
  // Rounded vowels
  o: { jawOpen: 0.55, mouthFunnel: 0.5, mouthPucker: 0.15 },
  u: { jawOpen: 0.2, mouthPucker: 0.55, mouthFunnel: 0.35 },
  // Bilabials (lips together)
  b: { mouthClose: 0.6, mouthPressLeft: 0.4, mouthPressRight: 0.4, jawOpen: 0.05 },
  m: { mouthClose: 0.7, mouthPressLeft: 0.5, mouthPressRight: 0.5, jawOpen: 0.02 },
  p: { mouthClose: 0.65, mouthPressLeft: 0.45, mouthPressRight: 0.45, jawOpen: 0.03 },
  // Labiodentals
  f: { mouthRollLower: 0.5, mouthUpperUpLeft: 0.2, mouthUpperUpRight: 0.2, jawOpen: 0.1 },
  v: { mouthRollLower: 0.45, mouthUpperUpLeft: 0.15, mouthUpperUpRight: 0.15, jawOpen: 0.12 },
  // Dental/Alveolars
  t: { jawOpen: 0.15, mouthLowerDownLeft: 0.1, mouthLowerDownRight: 0.1, mouthShrugUpper: 0.15 },
  d: { jawOpen: 0.2, mouthLowerDownLeft: 0.12, mouthLowerDownRight: 0.12, mouthShrugUpper: 0.1 },
  n: { jawOpen: 0.12, mouthClose: 0.2, mouthShrugUpper: 0.1 },
  l: { jawOpen: 0.25, tongueOut: 0.12, mouthLowerDownLeft: 0.1, mouthLowerDownRight: 0.1 },
  // Sibilants
  s: { jawOpen: 0.08, mouthStretchLeft: 0.35, mouthStretchRight: 0.35, mouthSmileLeft: 0.1, mouthSmileRight: 0.1 },
  z: { jawOpen: 0.1, mouthStretchLeft: 0.3, mouthStretchRight: 0.3 },
  // Post-alveolar
  r: { jawOpen: 0.2, mouthFunnel: 0.25, mouthPucker: 0.15 },
  // Palatal
  y: { jawOpen: 0.18, mouthSmileLeft: 0.3, mouthSmileRight: 0.3, mouthStretchLeft: 0.15, mouthStretchRight: 0.15 },
  // Velar
  k: { jawOpen: 0.3, mouthLowerDownLeft: 0.15, mouthLowerDownRight: 0.15 },
  g: { jawOpen: 0.32, mouthLowerDownLeft: 0.18, mouthLowerDownRight: 0.18 },
  // Glottal
  h: { jawOpen: 0.4, mouthLowerDownLeft: 0.15, mouthLowerDownRight: 0.15 },
  // Fricatives
  c: { jawOpen: 0.08, mouthStretchLeft: 0.3, mouthStretchRight: 0.3 },
  j: { jawOpen: 0.22, mouthFunnel: 0.3, mouthShrugUpper: 0.1 },
  q: { jawOpen: 0.3, mouthPucker: 0.3 },
  w: { jawOpen: 0.15, mouthPucker: 0.6, mouthFunnel: 0.4 },
  x: { jawOpen: 0.08, mouthStretchLeft: 0.3, mouthStretchRight: 0.3 },
};

const SILENCE = {};
blendShapeNames.forEach((name) => { SILENCE[name] = 0; });

function getVisemeForChar(ch) {
  const lower = ch.toLowerCase();
  return VISEME_MAP[lower] || null;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpBlendshapes(from, to, t) {
  const result = {};
  blendShapeNames.forEach((name) => {
    result[name] = lerp(from[name] || 0, to[name] || 0, t);
  });
  return result;
}

function generateBlendData(alignment) {
  if (!alignment || !alignment.characters || alignment.characters.length === 0) {
    return [];
  }

  const { characters, character_start_times_seconds, character_end_times_seconds } = alignment;
  const lastEnd = character_end_times_seconds[character_end_times_seconds.length - 1];
  const totalFrames = Math.ceil(lastEnd * FPS) + 1;
  const blendData = [];

  // Build a timeline of viseme targets with start/end times
  const events = [];
  for (let i = 0; i < characters.length; i++) {
    const viseme = getVisemeForChar(characters[i]);
    if (viseme) {
      events.push({
        start: character_start_times_seconds[i],
        end: character_end_times_seconds[i],
        viseme,
      });
    }
  }

  for (let frame = 0; frame < totalFrames; frame++) {
    const time = frame / FPS;

    // Find the active event at this time
    let activeEvent = null;
    for (let i = events.length - 1; i >= 0; i--) {
      if (time >= events[i].start && time <= events[i].end) {
        activeEvent = events[i];
        break;
      }
    }

    let blendshapes;
    if (activeEvent) {
      const duration = activeEvent.end - activeEvent.start;
      const elapsed = time - activeEvent.start;
      const halfDur = duration / 2;

      // Ease in for first half, ease out for second half
      const t = elapsed <= halfDur
        ? elapsed / halfDur
        : 1 - (elapsed - halfDur) / halfDur;
      const eased = Math.max(0, Math.min(1, t));
      blendshapes = lerpBlendshapes(SILENCE, activeEvent.viseme, eased);
    } else {
      // Interpolate toward silence between characters
      blendshapes = { ...SILENCE };
    }

    blendData.push({ time, blendshapes });
  }

  return blendData;
}

async function textToSpeechElevenLabs(text, voiceId) {
  const vid = voiceId || DEFAULT_VOICE_ID;
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${vid}/with-timestamps`;

  const response = await axios.post(
    url,
    {
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true,
      },
    },
    {
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  const { audio_base64, alignment } = response.data;
  const audioBuffer = Buffer.from(audio_base64, "base64");
  const blendData = generateBlendData(alignment);

  return { audioBuffer, blendData };
}

async function speechToTextElevenLabs(audioBuffer, originalName, languageCode) {
  const url = "https://api.elevenlabs.io/v1/speech-to-text";

  const form = new FormData();
  form.append("file", audioBuffer, {
    filename: originalName || "recording.wav",
    contentType: "audio/wav",
  });
  form.append("model_id", "scribe_v2");
  if (languageCode) {
    form.append("language_code", languageCode);
  }

  const response = await axios.post(url, form, {
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      ...form.getHeaders(),
    },
  });

  return response.data;
}

module.exports = { textToSpeechElevenLabs, speechToTextElevenLabs };
