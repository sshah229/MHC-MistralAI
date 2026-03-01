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
  text,
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
        // node.material.shininess = 60;
        node.material.roughness = 1.7;

        // node.material.specularMap = bodySpecularTexture;
        node.material.roughnessMap = bodyRoughnessTexture;
        node.material.normalMap = bodyNormalTexture;
        node.material.normalScale = new Vector2(0.6, 0.6);

        morphTargetDictionaryBody = node.morphTargetDictionary;

        node.material.envMapIntensity = 0.8;
        // node.material.visible = false;
      }

      if (node?.name.includes("Eyes")) {
        node.material = new MeshStandardMaterial();
        node.material.map = eyesTexture;
        // node.material.shininess = 100;
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
    if (speak === false) return;

    makeSpeech(text)
      .then((response) => {
        const payload = response?.data || {};
        const blendData = Array.isArray(payload.blendData) ? payload.blendData : [];
        let { filename } = payload;
        if (!filename) {
          throw new Error("TTS response missing filename");
        }
        console.log(response.data);
        let newClips = [
          createAnimation(blendData, morphTargetDictionaryBody, "HG_Body"),
          createAnimation(
            blendData,
            morphTargetDictionaryLowerTeeth,
            "HG_TeethLower"
          ),
        ].filter(Boolean);

        filename = host + filename;
        console.log(filename);
        setClips(newClips);
        setAudioSource(filename);
      })
      .catch((err) => {
        console.error(err);
        setSpeak(false);
      });
  }, [speak]);

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
    top: "20px",
    left: "10px",
    zIndex: 500,
    width: "50vw",
  },
  text: {
    margin: "0px",
    width: "300px",
    padding: "5px",
    background: "none",
    color: "#ffffff",
    fontSize: "1.2em",
    border: "none",
  },
  speak: {
    padding: "10px",
    marginTop: "5px",
    display: "block",
    color: "#FFFFFF",
    background: "#222222",
    border: "None",
  },
  area2: { position: "absolute", top: "5px", right: "15px", zIndex: 500 },
  label: { color: "#777777", fontSize: "0.8em" },
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
  const [chats, setChats] = useState([]);
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
  const [inputText, setInputText] = useState("");
  const [language, setLanguage] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [moodJourney, setMoodJourney] = useState(null);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [facialEmotion, setFacialEmotion] = useState(null);
  const [faceModelsLoaded, setFaceModelsLoaded] = useState(false);
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
    setSpeak(false);
    setPlaying(false);
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
          { role: "Guardian", msg: SAFETY_AUTO_CALL_RESPONSE, agent: "guardian" },
        ]);
        setInputText("");
        setSpeak(true);
        return;
      }

      const { data } = await axios.post("http://localhost:3000/chatbot", {
        message: "Answer this as a mental health companion, a friend and you will support me no matter what " +
          message,
        email,
        language: language || undefined,
        sessionId: sessionId || undefined,
        facialEmotion: facialEmotion || undefined,
      });
      const { answer, sentiment, agent, agentName, action } = data;
      setText(answer);
      setChats(prev => [
        ...prev,
        { role: "User", msg: message },
        { role: agentName || "Companion", msg: answer, agent },
      ]);
      setInputText("");
      setSpeak(true);

      if (action === "breathing_exercise") {
        setTimeout(() => navigate("/breathing"), 3000);
      }

      const key = sentiment?.toLowerCase();
      const chosen = goalMap[key];
      console.log("Auto‑add check:", { sentiment, key, chosen, email });
      if (chosen && email) {
        await axios.post("http://localhost:3000/goals/create", {
          email,
          ...chosen,
        });
        console.log(`Auto‑added goal for ${sentiment}:`, chosen.label);
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
    <div className="w-full flex">
      <div className="absolute flex items-center right-4 top-4 z-[1000]">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="mr-4 px-3 py-1.5 rounded-lg bg-white/80 text-sm border border-sky-300 text-sky-700 outline-none"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
        <h1 className="text-xl text-sky-500 mr-4">{name}</h1>
        <div className="h-12 w-12 rounded-full bg-gray-300/30 flex justify-center items-center text-sky-500">
          <BiSolidUser size={30} />
        </div>
      </div>
      <div className="relative w-[50vw]">
        <div
          style={STYLES.area}
          className="flex flex-col justify-between h-[90vh]"
        >
          <div
            className={`max-w-[350px] ${!chat && "invisible"
              } flex flex-col mb-16 min-h-[450px]`}
          >
            <div
              className="bg-sky-50 max-w-[350px] flex flex-col p-4 min-h-[450px] max-h-[450px] overflow-y-auto"
              style={{
                zIndex: 1000,
              }}
            >
              <h1 className="text-center text-xl font-semibold mb-2">
                Chat Window
              </h1>
              {chats?.map((chat, idx) => {
                const agentColors = {
                  listener: "bg-blue-100 text-blue-700",
                  coach: "bg-green-100 text-green-700",
                  guardian: "bg-red-100 text-red-700",
                };
                const badgeClass = chat.agent ? agentColors[chat.agent] || "" : "";
                return (
                  <div key={idx} className="mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{chat.role}</span>
                      {chat.agent && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${badgeClass}`}>
                          {chat.role}
                        </span>
                      )}
                    </div>
                    <p className="text-lg">{chat.msg}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 bg-white flex flex-row p-2 rounded">
              <input
                type="text"
                placeholder="Enter Message"
                className="w-full outline-none"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button
                onClick={() => {
                  console.log("Hello");
                  getResponse(inputText);
                }}
              >
                <AiOutlineSend className="ml-4" size={25} />
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setChat((prev) => !prev)}
              className="bg-teal-200 p-2 rounded text-lg w-[100px] mb-6"
            >
              Chat
            </button>
            <button
              onClick={endSession}
              className="bg-purple-200 p-2 rounded text-lg w-[140px] mb-6"
            >
              End Session
            </button>
          </div>
          <div className="flex flex-col">
            <p className="text-md text-white mb-2">{voiceStatusLabel}</p>
            <div className="flex flex-row items-center gap-3">
              <button
                className={`p-3 rounded-full text-lg w-[56px] h-[56px] flex items-center justify-center transition ${
                  listening ? "bg-red-200 text-red-700" : "bg-teal-200 text-teal-700"
                } ${sttLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                onClick={handleMicButton}
                disabled={sttLoading}
                title={listening ? "Stop and send" : "Start listening"}
              >
                {listening ? <FiMicOff size={22} /> : <FiMic size={22} />}
              </button>
              <button
                className={`px-3 py-2 rounded-full text-sm transition ${
                  handsFree ? "bg-purple-200 text-purple-800" : "bg-white/80 text-gray-700"
                }`}
                onClick={toggleHandsFree}
                disabled={sttLoading}
                title="Toggle hands-free mode"
              >
                Hands-free: {handsFree ? "On" : "Off"}
              </button>
              {handsFree && (
                <button
                  className="p-2 rounded-full bg-white/80 text-gray-700"
                  onClick={toggleHandsFree}
                  title="Pause hands-free"
                >
                  <FiPauseCircle size={22} />
                </button>
              )}

              {facialEmotion && (
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                  Detected: {facialEmotion}
                </span>
              )}
              <Webcam
                ref={imgRef}
                audio={false}
                height={0}
                screenshotFormat="image/jpeg"
                width={0}
                videoConstraints={videoConstraints}
              >
                {() => (
                  <button
                    className="hidden"
                    aria-hidden
                  >
                    Hidden capture trigger
                  </button>
                )}
              </Webcam>
            </div>
          </div>
        </div>
        <div className="w-0 h-0">
          <ReactAudioPlayer
            src={audioSource}
            ref={audioPlayer}
            onEnded={playerEnded}
            onCanPlayThrough={playerReady}
          />
        </div>

        {/* <Stats /> */}
        <div className="w-[83vw]">
          <Canvas
            dpr={2}
            onCreated={(ctx) => {
              ctx.gl.physicallyCorrectLights = true;
            }}
          >
            <OrthographicCamera
              makeDefault
              zoom={1700}
              position={[0, 1.65, 1]}
            />

            {/* <OrbitControls
          target={[0, 1.65, 0]}
        /> */}

            <Suspense fallback={null}>
              <Environment
                background={false}
                files="/images/photo_studio_loft_hall_1k.hdr"
              />
            </Suspense>

            <Suspense fallback={null}>
              <Bg />
            </Suspense>

            <Suspense fallback={null}>
              <Avatar
                avatar_url="/model.glb"
                speak={speak}
                setSpeak={setSpeak}
                text={text}
                setAudioSource={setAudioSource}
                playing={playing}
              />
            </Suspense>
          </Canvas>
        </div>
        <Loader dataInterpolation={(p) => `Loading... please wait`} />
      </div>

      {moodJourney && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-purple-700 mb-4">Your Mood Journey</h2>
            {sessionSummary && (
              <p className="text-gray-700 mb-4 italic">{sessionSummary}</p>
            )}
            <div className="space-y-2">
              {moodJourney.map((point, i) => {
                const colors = {
                  Happy: "bg-green-200 text-green-800",
                  Sad: "bg-blue-200 text-blue-800",
                  Anxious: "bg-yellow-200 text-yellow-800",
                  Angry: "bg-red-200 text-red-800",
                  Neutral: "bg-gray-200 text-gray-800",
                };
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600">
                      {i + 1}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${colors[point.emotion_category] || "bg-gray-100"}`}>
                      {point.emotion_category}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3">
                      <div
                        className="bg-purple-500 h-3 rounded-full transition-all"
                        style={{ width: `${(point.emotion_intensity / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500">{point.emotion_intensity}/10</span>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => { setMoodJourney(null); setSessionSummary(null); }}
              className="mt-6 w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition"
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
