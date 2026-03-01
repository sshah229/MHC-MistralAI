import React, { Suspense, useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AiOutlineSend } from "react-icons/ai";
import {
  useGLTF,
  useTexture,
  Loader,
  Environment,
  useFBX,
  useAnimations,
  OrthographicCamera,
} from "@react-three/drei";
import { MeshStandardMaterial } from "three/src/materials/MeshStandardMaterial";

import { LinearEncoding, sRGBEncoding } from "three/src/constants";
import { LineBasicMaterial, MeshPhysicalMaterial, Vector2 } from "three";
import ReactAudioPlayer from "react-audio-player";
import createAnimation from "../../converter";
import blinkData from "../../blendDataBlink.json";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import * as THREE from "three";
import axios from "axios";
import Webcam from "react-webcam";
import { BiSolidUser } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiMic, FiMicOff, FiPauseCircle } from "react-icons/fi";
import * as faceapi from "face-api.js";
const _ = require("lodash");

const host = "http://localhost:3000/";
const FACIAL_SENTIMENT_API = "http://localhost:5001/analyze";
const DISTRESS_EMOTIONS = new Set(["fear", "sad", "angry", "disgust"]);
const DISTRESS_CONSECUTIVE_THRESHOLD = 10;
const EMERGENCY_CALL_COOLDOWN_MS = 10 * 60 * 1000;
const SILENCE_SUBMIT_MS = 1400;
const HANDS_FREE_MAX_MS = 3 * 60 * 1000;
const AUTO_RESTART_MS = 450;
const SELF_HARM_PATTERNS = [
  /\bi want to suicide\b/i,
  /\bi want to kill myself\b/i,
  /\bi will kill myself\b/i,
  /\bi want to die\b/i,
  /\bi should die\b/i,
  /\bend my life\b/i,
  /\bsuicide\b/i,
  /\bself harm\b/i,
  /\bharm myself\b/i,
];
const SAFETY_AUTO_CALL_RESPONSE =
  "I am here with you. I have alerted your emergency contact for immediate support. Please stay where you are, take slow breaths, and focus on your safety right now.";
function Avatar({
  avatar_url,
  speak,
  setSpeak,
  audioPayload,
  setAudioSource,
  playing,
}) {
  let gltf = useGLTF(avatar_url);
  let morphTargetDictionaryBody = null;
  let morphTargetDictionaryLowerTeeth = null;

  const [
    bodyTexture,
    eyesTexture,
    teethTexture,
    bodySpecularTexture,
    bodyRoughnessTexture,
    bodyNormalTexture,
    teethNormalTexture,
    // teethSpecularTexture,
    hairTexture,
    tshirtDiffuseTexture,
    tshirtNormalTexture,
    tshirtRoughnessTexture,
    hairAlphaTexture,
    hairNormalTexture,
    hairRoughnessTexture,
  ] = useTexture([
    "/images/body.webp",
    "/images/eyes.webp",
    "/images/teeth_diffuse.webp",
    "/images/body_specular.webp",
    "/images/body_roughness.webp",
    "/images/body_normal.webp",
    "/images/teeth_normal.webp",
    // "/images/teeth_specular.webp",
    "/images/h_color.webp",
    "/images/tshirt_diffuse.webp",
    "/images/tshirt_normal.webp",
    "/images/tshirt_roughness.webp",
    "/images/h_alpha.webp",
    "/images/h_normal.webp",
    "/images/h_roughness.webp",
  ]);

  _.each(
    [
      bodyTexture,
      eyesTexture,
      teethTexture,
      teethNormalTexture,
      bodySpecularTexture,
      bodyRoughnessTexture,
      bodyNormalTexture,
      tshirtDiffuseTexture,
      tshirtNormalTexture,
      tshirtRoughnessTexture,
      hairAlphaTexture,
      hairNormalTexture,
      hairRoughnessTexture,
    ],
    (t) => {
      t.encoding = sRGBEncoding;
      t.flipY = false;
    }
  );

  bodyNormalTexture.encoding = LinearEncoding;
  tshirtNormalTexture.encoding = LinearEncoding;
  teethNormalTexture.encoding = LinearEncoding;
  hairNormalTexture.encoding = LinearEncoding;

  gltf.scene.traverse((node) => {
    if (
      node.type === "Mesh" ||
      node.type === "LineSegments" ||
      node.type === "SkinnedMesh"
    ) {
      node.castShadow = true;
      node.receiveShadow = true;
      node.frustumCulled = false;

      if (node?.name.includes("Body")) {
        node.castShadow = true;
        node.receiveShadow = true;

        node.material = new MeshPhysicalMaterial();
        node.material.map = bodyTexture;
        node.material.roughness = 1.7;
        node.material.roughnessMap = bodyRoughnessTexture;
        node.material.normalMap = bodyNormalTexture;
        node.material.normalScale = new Vector2(0.6, 0.6);

        morphTargetDictionaryBody = node.morphTargetDictionary;

        node.material.envMapIntensity = 0.8;
      }

      if (node?.name.includes("Eyes")) {
        node.material = new MeshStandardMaterial();
        node.material.map = eyesTexture;
        node.material.roughness = 0.1;
        node.material.envMapIntensity = 0.5;
      }

      if (node?.name.includes("Brows")) {
        node.material = new LineBasicMaterial({ color: 0x000000 });
        node.material.linewidth = 1;
        node.material.opacity = 0.5;
        node.material.transparent = true;
        node.visible = false;
      }

      if (node?.name.includes("Teeth")) {
        node.receiveShadow = true;
        node.castShadow = true;
        node.material = new MeshStandardMaterial();
        node.material.roughness = 0.1;
        node.material.map = teethTexture;
        node.material.normalMap = teethNormalTexture;
        node.material.envMapIntensity = 0.7;
      }

      if (node?.name.includes("Hair")) {
        node.material = new MeshStandardMaterial();
        node.material.map = hairTexture;
        node.material.alphaMap = hairAlphaTexture;
        node.material.normalMap = hairNormalTexture;
        node.material.roughnessMap = hairRoughnessTexture;

        node.material.transparent = true;
        node.material.depthWrite = false;
        node.material.side = 2;
        node.material.color.setHex(0x000000);

        node.material.envMapIntensity = 0.3;
      }

      if (node?.name.includes("TSHIRT")) {
        node.material = new MeshStandardMaterial();

        node.material.map = tshirtDiffuseTexture;
        node.material.roughnessMap = tshirtRoughnessTexture;
        node.material.normalMap = tshirtNormalTexture;
        node.material.color.setHex(0xffffff);

        node.material.envMapIntensity = 0.5;
      }

      if (node?.name.includes("TeethLower")) {
        morphTargetDictionaryLowerTeeth = node.morphTargetDictionary;
      }
    }
  });

  const [clips, setClips] = useState([]);
  const mixer = useMemo(() => new THREE.AnimationMixer(gltf.scene), []);

  useEffect(() => {
    if (!speak || !audioPayload?.filename) return;
    const blendData = Array.isArray(audioPayload.blendData) ? audioPayload.blendData : [];
    const newClips = [
      createAnimation(blendData, morphTargetDictionaryBody, "HG_Body"),
      createAnimation(blendData, morphTargetDictionaryLowerTeeth, "HG_TeethLower"),
    ].filter(Boolean);
    setClips(newClips);
    setAudioSource(host + audioPayload.filename);
  }, [audioPayload]);

  let idleFbx = useFBX("/idle.fbx");
  let { clips: idleClips } = useAnimations(idleFbx.animations);

  idleClips[0].tracks = _.filter(idleClips[0].tracks, (track) => {
    return (
      track?.name.includes("Head") ||
      track?.name.includes("Neck") ||
      track?.name.includes("Spine2")
    );
  });

  idleClips[0].tracks = _.map(idleClips[0].tracks, (track) => {
    if (track?.name.includes("Head")) {
      track.name = "head.quaternion";
    }

    if (track?.name.includes("Neck")) {
      track.name = "neck.quaternion";
    }

    if (track?.name.includes("Spine")) {
      track.name = "spine2.quaternion";
    }

    return track;
  });

  useEffect(() => {
    let idleClipAction = mixer.clipAction(idleClips[0]);
    idleClipAction.play();

    let blinkClip = createAnimation(
      blinkData,
      morphTargetDictionaryBody,
      "HG_Body"
    );
    let blinkAction = mixer.clipAction(blinkClip);
    blinkAction.play();
  }, []);

  // Play animation clips when available
  useEffect(() => {
    if (playing === false) return;

    _.each(clips, (clip) => {
      if (!clip) return;
      let clipAction = mixer.clipAction(clip);
      clipAction.setLoop(THREE.LoopOnce);
      clipAction.play();
    });
  }, [playing]);

  useFrame((state, delta) => {
    mixer.update(delta);
  });

  return (
    <group name="avatar">
      <primitive object={gltf.scene} dispose={null} />
    </group>
  );
}

async function makeSpeech(text) {
  const hasValidFilename = (payload) =>
    payload && typeof payload.filename === "string" && payload.filename.trim().length > 0;

  const ttsRes = await axios.post(host + "voice/speak", { text }, { timeout: 8000 });
  if (hasValidFilename(ttsRes?.data)) {
    const blendData = Array.isArray(ttsRes.data.blendData) ? ttsRes.data.blendData : [];
    return { data: { blendData, filename: ttsRes.data.filename } };
  }

  throw new Error("Voice synthesis failed to produce audio");
}

const STYLES = {
  area: {
    position: "absolute",
    top: "0px",
    left: "0px",
    zIndex: 500,
    width: "100%",
    height: "100%",
  },
};

const LANGUAGES = [
  { code: "", label: "English", sttCode: "en" },
  { code: "Hindi", label: "Hindi", sttCode: "hi" },
  { code: "Spanish", label: "Spanish", sttCode: "es" },
  { code: "French", label: "French", sttCode: "fr" },
  { code: "German", label: "German", sttCode: "de" },
  { code: "Portuguese", label: "Portuguese", sttCode: "pt" },
  { code: "Japanese", label: "Japanese", sttCode: "ja" },
  { code: "Chinese", label: "Chinese", sttCode: "zh" },
];

const ChatBot = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState(() => {
    try {
      const saved = sessionStorage.getItem("sakhi_chats");
      if (saved) {
        sessionStorage.removeItem("sakhi_chats");
        return JSON.parse(saved);
      }
    } catch {}
    return [];
  });
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };
  const audioPlayer = useRef();

  const [speak, setSpeak] = useState(false);
  const [text, setText] = useState(
    "My name is Arwen. I'm a virtual human who can speak whatever you type here along with realistic facial movements."
  );
  const [chat, setChat] = useState(false);
  const [audioSource, setAudioSource] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [audioPayload, setAudioPayload] = useState(null);
  const audioQueueRef = useRef([]);
  const [inputText, setInputText] = useState("");
  const [language, setLanguage] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [moodJourney, setMoodJourney] = useState(null);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [facialEmotion, setFacialEmotion] = useState(null);
  const [faceModelsLoaded, setFaceModelsLoaded] = useState(false);
  const [preferredAgent, setPreferredAgent] = useState("");
  const faceIntervalRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const handsFreeTimerRef = useRef(null);
  const autoRestartTimerRef = useRef(null);
  const distressStreakRef = useRef(0);
  const emergencyInFlightRef = useRef(false);
  const lastEmergencyCallAtRef = useRef(0);
  const [handsFree, setHandsFree] = useState(false);
  const [voiceUiState, setVoiceUiState] = useState("idle");
  // End of play
  function playerEnded(e) {
    setAudioSource(null);
    setPlaying(false);

    if (audioQueueRef.current.length > 0) {
      const next = audioQueueRef.current.shift();
      setAudioPayload({ ...next });
      return;
    }

    setSpeak(false);
    setAudioPayload(null);
    if (handsFree) {
      setVoiceUiState("listening");
      if (autoRestartTimerRef.current) clearTimeout(autoRestartTimerRef.current);
      autoRestartTimerRef.current = setTimeout(() => {
        if (!sttLoading) {
          resetTranscript();
          SpeechRecognition.startListening({ continuous: true });
        }
      }, AUTO_RESTART_MS);
    } else {
      setVoiceUiState("idle");
    }
  }
  const name = JSON.parse(localStorage.getItem("data"))?.name;
  // Player is read
  function playerReady(e) {
    audioPlayer.current.audioEl.current.play();
    setPlaying(true);
    setVoiceUiState("speaking");
  }
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [sttLoading, setSttLoading] = useState(false);
  const imgRef = useRef();

  const user = JSON.parse(localStorage.getItem("data"));
  const email = user?.email;

  const clearVoiceTimers = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (handsFreeTimerRef.current) clearTimeout(handsFreeTimerRef.current);
    if (autoRestartTimerRef.current) clearTimeout(autoRestartTimerRef.current);
  };

  const startListeningSession = () => {
    if (!browserSupportsSpeechRecognition || sttLoading || playing) return;
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });
    setVoiceUiState("listening");
  };

  const buildEmergencyReasonText = ({ reason, messageText, emotion }) => {
    const parts = [];
    if (reason) parts.push(`Reason: ${reason}`);
    if (emotion) parts.push(`Detected emotion: ${emotion}`);
    if (messageText) parts.push(`User message: ${String(messageText).slice(0, 180)}`);
    return parts.join(". ");
  };

  const triggerEmergencyCall = async ({
    reason,
    messageText = "",
    emotion = "",
  }) => {
    const now = Date.now();
    if (!email) return;
    if (emergencyInFlightRef.current) return;

    if (now - lastEmergencyCallAtRef.current < EMERGENCY_CALL_COOLDOWN_MS) {
      return;
    }

    emergencyInFlightRef.current = true;
    try {
      toast.error("Hold tight! Calling emergency contact...", {
        position: "top-right",
        autoClose: 5000,
      });
      const emergencyMessage = buildEmergencyReasonText({ reason, messageText, emotion });
      const { data } = await axios.post("http://localhost:3000/emergency", {
        email,
        sessionId: sessionId || undefined,
        message: emergencyMessage || "Automatic emergency alert from Sakhi.",
      });
      lastEmergencyCallAtRef.current = Date.now();
      toast.success(`Emergency call queued: ${data.callSid || "sent"}`, {
        position: "top-right",
        autoClose: 6500,
      });
    } catch (err) {
      const msg = err?.response?.data?.error || "Emergency alert failed.";
      toast.error(msg, {
        position: "top-right",
        autoClose: 6500,
      });
    } finally {
      emergencyInFlightRef.current = false;
    }
  };

  const hasSelfHarmSignal = (text) => {
    const value = String(text || "").trim();
    if (!value) return false;
    return SELF_HARM_PATTERNS.some((pattern) => pattern.test(value));
  };

  const submitSpeechTurn = async (rawText, { showWarning = true } = {}) => {
    const browserText = String(rawText || "").trim();
    if (!browserText) {
      if (showWarning) {
        toast.warn("Could not recognize speech. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
      return false;
    }

    setSttLoading(true);
    setVoiceUiState("processing");
    try {
      await getResponse(browserText);
      return true;
    } finally {
      setSttLoading(false);
      setVoiceUiState("idle");
      resetTranscript();
    }
  };

  const stopListeningAndSubmit = async ({ showWarning = true } = {}) => {
    SpeechRecognition.stopListening();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    await submitSpeechTurn(transcript, { showWarning });
  };

  const handleMicButton = async () => {
    if (sttLoading) return;
    if (listening) {
      await stopListeningAndSubmit({ showWarning: !handsFree });
      return;
    }
    startListeningSession();
  };

  const toggleHandsFree = () => {
    const next = !handsFree;
    setHandsFree(next);
    if (!next) {
      SpeechRecognition.stopListening();
      clearVoiceTimers();
      setVoiceUiState("idle");
      return;
    }
    setVoiceUiState("listening");
    startListeningSession();
    handsFreeTimerRef.current = setTimeout(() => {
      setHandsFree(false);
      SpeechRecognition.stopListening();
      setVoiceUiState("idle");
      toast.info("Hands-free paused after 3 minutes. Tap to resume.", {
        position: "top-right",
        autoClose: 2500,
      });
    }, HANDS_FREE_MAX_MS);
  };

  useEffect(() => {
    if (email) {
      axios.post("http://localhost:3000/session/start", { userId: email })
        .then(({ data }) => setSessionId(data.sessionId))
        .catch((err) => console.error("Failed to start session:", err));
    }
  }, [email]);

  useEffect(() => {
    const loadFaceModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");
        setFaceModelsLoaded(true);
        console.log("Face-api models loaded");
      } catch (err) {
        console.error("Failed to load face-api models:", err);
      }
    };
    loadFaceModels();
    return () => {
      if (faceIntervalRef.current) clearInterval(faceIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!imgRef.current) return;

    const detectEmotionFromPythonService = async () => {
      const screenshot = imgRef.current?.getScreenshot?.();
      if (!screenshot) return null;

      const blob = await fetch(screenshot).then((res) => res.blob());
      const formData = new FormData();
      formData.append("frame", blob, "frame.jpg");

      const { data } = await axios.post(FACIAL_SENTIMENT_API, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 2200,
      });

      if (data?.faceDetected && data?.facialEmotion) {
        return String(data.facialEmotion).toLowerCase();
      }
      return null;
    };

    faceIntervalRef.current = setInterval(async () => {
      try {
        let topEmotion = null;

        try {
          topEmotion = await detectEmotionFromPythonService();
        } catch {}

        if (!topEmotion && faceModelsLoaded) {
          const video = imgRef.current?.video;
          if (video && video.readyState >= 2) {
            const detections = await faceapi
              .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
              .withFaceExpressions();
            if (detections?.expressions) {
              const sorted = Object.entries(detections.expressions).sort((a, b) => b[1] - a[1]);
              topEmotion = sorted[0][0];
            }
          }
        }

        if (topEmotion) {
          setFacialEmotion(topEmotion);

          if (DISTRESS_EMOTIONS.has(topEmotion)) {
            distressStreakRef.current += 1;
            if (distressStreakRef.current >= DISTRESS_CONSECUTIVE_THRESHOLD) {
              distressStreakRef.current = 0;
              await triggerEmergencyCall({
                reason: "Sustained high facial distress detected",
                emotion: topEmotion,
              });
            }
          } else {
            distressStreakRef.current = 0;
          }
        }
      } catch {}
    }, 3000);

    return () => {
      if (faceIntervalRef.current) clearInterval(faceIntervalRef.current);
    };
  }, [faceModelsLoaded]);

  const endSession = async () => {
    if (!sessionId) return;
    try {
      const { data } = await axios.post("http://localhost:3000/session/end", { sessionId });
      setSessionSummary(data.summary);
      setMoodJourney(data.moodTimeline);
    } catch (err) {
      console.error("Failed to end session:", err);
    }
  };

  const goalMap = {
    anxious: {
      label: "Take a 2‑minute breathing break",
      type: "breathing_exercise",
      frequency: 120,
    },
    sad: {
      label: "Write down 3 things you’re grateful for",
      type: "gratitude_journal",
      frequency: 1440, // once a day
    },
    angry: {
      label: "Go for a 5‑minute walk to cool down",
      type: "mindful_walk",
      frequency: 180, // every 3 hours if still angry
    },
  };

  const getResponse = async (message) => {
    try {
      if (hasSelfHarmSignal(message)) {
        await triggerEmergencyCall({
          reason: "Possible self-harm intent detected in user speech",
          messageText: message,
        });

        setText(SAFETY_AUTO_CALL_RESPONSE);
        setChats((prev) => [
          ...prev,
          { role: "User", msg: message },
          { role: "Haven", msg: SAFETY_AUTO_CALL_RESPONSE, agent: "haven" },
        ]);
        setInputText("");
        try {
          const ttsResult = await makeSpeech(SAFETY_AUTO_CALL_RESPONSE);
          audioQueueRef.current = [];
          setAudioPayload(ttsResult.data);
          setSpeak(true);
        } catch { setSpeak(false); }
        return;
      }

      setChats((prev) => [...prev, { role: "User", msg: message }]);
      setInputText("");

      const response = await fetch(host + "chatbot/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          email,
          language: language || undefined,
          sessionId: sessionId || undefined,
          facialEmotion: facialEmotion || undefined,
          preferredAgent: preferredAgent || undefined,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";
      let sentenceBuffer = "";
      let firstSentenceFired = false;
      let meta = null;
      const ttsPromises = [];
      let currentEventType = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEventType = line.slice(7).trim();
          } else if (line.startsWith("data: ") && currentEventType) {
            try {
              const data = JSON.parse(line.slice(6));
              if (currentEventType === "chunk" && data.text) {
                fullText += data.text;
                sentenceBuffer += data.text;

                setChats((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.streaming) {
                    return [...updated.slice(0, -1), { ...last, msg: fullText }];
                  }
                  return [...updated, { role: "Companion", msg: fullText, streaming: true }];
                });

                if (!firstSentenceFired && /[.!?]\s*$/.test(sentenceBuffer)) {
                  firstSentenceFired = true;
                  const sentence = sentenceBuffer.trim();
                  sentenceBuffer = "";
                  ttsPromises.push(makeSpeech(sentence).then((r) => r.data).catch(() => null));
                }
              } else if (currentEventType === "meta") {
                meta = data;
              }
            } catch {}
            currentEventType = null;
          }
        }
      }

      if (sentenceBuffer.trim()) {
        ttsPromises.push(makeSpeech(sentenceBuffer.trim()).then((r) => r.data).catch(() => null));
      } else if (!firstSentenceFired && fullText.trim()) {
        ttsPromises.push(makeSpeech(fullText.trim()).then((r) => r.data).catch(() => null));
      }

      const ttsResults = (await Promise.all(ttsPromises)).filter(Boolean);

      const agentName = meta?.agentName || "Companion";
      setChats((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.streaming) {
          return [
            ...updated.slice(0, -1),
            { role: agentName, msg: fullText, agent: meta?.agent },
          ];
        }
        return updated;
      });
      setText(fullText);

      if (ttsResults.length > 0) {
        audioQueueRef.current = ttsResults.slice(1);
        setAudioPayload(ttsResults[0]);
        setSpeak(true);
      }

      if (meta?.action === "breathing_exercise") {
        setTimeout(() => {
          setChats((prev) => {
            sessionStorage.setItem("sakhi_chats", JSON.stringify(prev));
            return prev;
          });
          navigate("/breathing");
        }, 3000);
      }

      const key = meta?.sentiment?.toLowerCase();
      const chosen = goalMap[key];
      if (chosen && email) {
        axios.post("http://localhost:3000/goals/create", { email, ...chosen }).catch(() => {});
      }
    } catch (err) {
      console.error("getResponse error:", err);
    }
  };

  useEffect(() => {
    if (!listening || sttLoading || playing) return;
    const value = transcript?.trim();
    if (!value) return;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(async () => {
      await stopListeningAndSubmit({ showWarning: !handsFree });
    }, SILENCE_SUBMIT_MS);

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [transcript, listening, sttLoading, playing, handsFree]);

  useEffect(() => {
    return () => {
      clearVoiceTimers();
    };
  }, []);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const voiceStatusByState = {
    idle: "Mic ready",
    listening: "Listening...",
    processing: "Processing...",
    speaking: "Speaking...",
    paused: "Paused",
  };
  const voiceStatusLabel = transcript || voiceStatusByState[voiceUiState] || "Mic ready";

  return (
    <div className="w-full h-screen bg-slate-950 relative overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-6 py-3 bg-slate-900/60 backdrop-blur-md border-b border-white/5">
        <div className="w-10" />
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-sm border border-white/10 text-slate-300 outline-none cursor-pointer hover:border-teal-500/50 transition"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
          <select
            value={preferredAgent}
            onChange={(e) => setPreferredAgent(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-sm border border-white/10 text-slate-300 outline-none cursor-pointer hover:border-teal-500/50 transition"
          >
            <option value="">Auto</option>
            <option value="sakhi">Sakhi</option>
            <option value="sage">Sage</option>
            <option value="haven">Haven</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">{name}</span>
          <div className="h-9 w-9 rounded-full bg-slate-800 border border-white/10 flex justify-center items-center text-teal-400">
            <BiSolidUser size={18} />
          </div>
        </div>
      </div>

      {/* 3D Canvas — full screen behind everything */}
      <div className="absolute inset-0">
        <Canvas
          dpr={2}
          onCreated={(ctx) => {
            ctx.gl.physicallyCorrectLights = true;
          }}
        >
          <OrthographicCamera makeDefault zoom={1700} position={[0, 1.65, 1]} />
          <Suspense fallback={null}>
            <Environment background={false} files="/images/photo_studio_loft_hall_1k.hdr" />
          </Suspense>
          <Suspense fallback={null}>
            <Bg />
          </Suspense>
          <Suspense fallback={null}>
            <Avatar
              avatar_url="/model.glb"
              speak={speak}
              setSpeak={setSpeak}
              audioPayload={audioPayload}
              setAudioSource={setAudioSource}
              playing={playing}
            />
          </Suspense>
        </Canvas>
        <Loader dataInterpolation={(p) => `Loading... please wait`} />
      </div>

      {/* Hidden audio player */}
      <div className="w-0 h-0">
        <ReactAudioPlayer
          src={audioSource}
          ref={audioPlayer}
          onEnded={playerEnded}
          onCanPlayThrough={playerReady}
        />
      </div>

      {/* Hidden webcam */}
      <Webcam
        ref={imgRef}
        audio={false}
        height={0}
        screenshotFormat="image/jpeg"
        width={0}
        videoConstraints={videoConstraints}
        className="absolute w-0 h-0 opacity-0"
      >
        {() => <button className="hidden" aria-hidden>Hidden capture trigger</button>}
      </Webcam>

      {/* Chat panel — slides in from left */}
      <div
        className={`absolute top-16 left-4 bottom-28 z-[800] w-[380px] flex flex-col transition-all duration-300 ${
          chat ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex-1 bg-slate-900/80 backdrop-blur-lg border border-white/5 rounded-2xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chats?.length === 0 && (
              <p className="text-slate-500 text-sm text-center mt-8">Start a conversation...</p>
            )}
            {chats?.map((c, idx) => {
              const isUser = c.role === "You";
              const agentColors = {
                sakhi: "text-purple-400",
                sage: "text-emerald-400",
                haven: "text-amber-400",
              };
              const agentBadgeColors = {
                sakhi: "bg-purple-500/20 text-purple-300",
                sage: "bg-emerald-500/20 text-emerald-300",
                haven: "bg-amber-500/20 text-amber-300",
              };
              return (
                <div key={idx} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[90%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? "bg-teal-500/20 text-teal-100 rounded-br-md"
                        : "bg-slate-800/80 text-slate-200 rounded-bl-md"
                    }`}
                  >
                    {!isUser && c.agent && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold ${agentColors[c.agent] || "text-slate-400"}`}>
                          {c.role}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${agentBadgeColors[c.agent] || "bg-slate-700 text-slate-400"}`}>
                          {c.agent}
                        </span>
                      </div>
                    )}
                    <p>{c.msg}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Input */}
          <div className="p-3 border-t border-white/5">
            <div className="flex items-center gap-2 bg-slate-800/60 rounded-xl px-3 py-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inputText.trim()) getResponse(inputText);
                }}
              />
              <button
                onClick={() => { if (inputText.trim()) getResponse(inputText); }}
                className="p-2 rounded-lg bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 transition"
              >
                <AiOutlineSend size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-[800] px-6 py-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {/* Left: action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChat((prev) => !prev)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                chat
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                  : "bg-slate-800/80 text-slate-400 border border-white/5 hover:text-slate-200"
              }`}
            >
              {chat ? "Hide Chat" : "Chat"}
            </button>
            <button
              onClick={endSession}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800/80 text-slate-400 border border-white/5 hover:text-slate-200 transition-all"
            >
              End Session
            </button>
          </div>

          {/* Center: mic + voice controls */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 mr-1">{voiceStatusLabel}</span>
            <button
              className={`p-3 rounded-full transition-all ${
                listening
                  ? "bg-red-500/20 text-red-400 border border-red-500/30 shadow-lg shadow-red-500/10"
                  : "bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10"
              } ${sttLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handleMicButton}
              disabled={sttLoading}
              title={listening ? "Stop and send" : "Start listening"}
            >
              {listening ? <FiMicOff size={20} /> : <FiMic size={20} />}
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                handsFree
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                  : "bg-slate-800/80 text-slate-400 border-white/5 hover:text-slate-200"
              }`}
              onClick={toggleHandsFree}
              disabled={sttLoading}
              title="Toggle hands-free mode"
            >
              Hands-free: {handsFree ? "On" : "Off"}
            </button>
            {handsFree && (
              <button
                className="p-1.5 rounded-full bg-slate-800/80 text-slate-400 border border-white/5 hover:text-slate-200 transition"
                onClick={toggleHandsFree}
                title="Pause hands-free"
              >
                <FiPauseCircle size={18} />
              </button>
            )}
          </div>

          {/* Right: emotion badge */}
          <div className="flex items-center gap-2 min-w-[120px] justify-end">
            {facialEmotion && (
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full text-xs">
                {facialEmotion}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mood Journey Modal */}
      {moodJourney && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent mb-4">
              Your Mood Journey
            </h2>
            {sessionSummary && (
              <p className="text-slate-400 mb-4 italic text-sm">{sessionSummary}</p>
            )}
            <div className="space-y-3">
              {moodJourney.map((point, i) => {
                const colors = {
                  Happy: "bg-green-500/20 text-green-300",
                  Sad: "bg-blue-500/20 text-blue-300",
                  Anxious: "bg-yellow-500/20 text-yellow-300",
                  Angry: "bg-red-500/20 text-red-300",
                  Neutral: "bg-slate-700/50 text-slate-300",
                };
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-teal-500/20 flex items-center justify-center text-xs font-bold text-teal-300">
                      {i + 1}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs ${colors[point.emotion_category] || "bg-slate-700 text-slate-400"}`}>
                      {point.emotion_category}
                    </span>
                    <div className="flex-1 bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-cyan-400 h-2 rounded-full transition-all"
                        style={{ width: `${(point.emotion_intensity / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{point.emotion_intensity}/10</span>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => { setMoodJourney(null); setSessionSummary(null); }}
              className="mt-6 w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-teal-500/20 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function Bg() {
  const texture = useTexture("/images/bg.webp");

  return (
    <mesh position={[0, 1.5, -2]} scale={[0.9, 0.8, 0.9]}>
      <planeBufferGeometry />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

export default ChatBot;
