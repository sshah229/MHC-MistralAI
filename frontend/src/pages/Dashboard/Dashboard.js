// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

const emotionMap = [
  { category: "Happy", emoji: "😊" },
  { category: "Sad", emoji: "😢" },
  { category: "Neutral", emoji: "😐" },
  { category: "Anxious", emoji: "😰" },
  { category: "Angry", emoji: "😠" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [range, setRange] = useState("30m");
  const [summary, setSummary] = useState("Loading insights...");

  // Fetch raw logs
  useEffect(() => {
    axios
      .get("http://localhost:3000/emotions")
      .then((res) => setLogs(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch Gemini summary on range change
  useEffect(() => {
    setSummary("Loading insights...");
    axios
      .get("http://localhost:3000/emotions/summary", { params: { range } })
      .then((res) => setSummary(res.data.summary))
      .catch((err) => {
        console.error(err);
        setSummary("Could not load insights.");
      });
  }, [range]);

  // Compute threshold
  const now = new Date();
  let threshold;
  if (range === "30m") threshold = new Date(now - 30 * 60 * 1000);
  else if (range === "week") threshold = new Date(now - 7 * 24 * 60 * 60 * 1000);
  else threshold = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const filtered = logs.filter((e) => new Date(e.timestamp) >= threshold);

  // Emoji status
  const emojiStatus = emotionMap.map((e) => ({
    ...e,
    experienced: filtered.some((f) => f.emotion_category === e.category),
  }));

  // Individual intensity points (one per log)
  const intensityPoints = filtered
    .map(({ emotion_intensity, timestamp }) => ({
      timestamp,
      intensity: emotion_intensity,
    }))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Frequency data
  const freq = filtered.reduce((acc, { emotion_category }) => {
    acc[emotion_category] = (acc[emotion_category] || 0) + 1;
    return acc;
  }, {});
  const freqData = emotionMap.map((e) => ({
    emotion: e.category,
    count: freq[e.category] || 0,
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="flex-1 p-8 overflow-y-auto space-y-6">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/insights"))}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <FiArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>
        {/* Header + Range Buttons */}
        <div className="flex items-center justify-between bg-blue-500/20 border border-blue-400/20 p-4 rounded-2xl">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Mood Dashboard</h1>
          <div className="space-x-2">
            {[
              { key: "30m", label: "Last 30 mins" },
              { key: "week", label: "Last Week" },
              { key: "month", label: "Last Month" },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`px-3 py-1 rounded-lg transition ${
                  range === key ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
                onClick={() => setRange(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Gemini Summary */}
        <div className="bg-slate-900/80 border border-white/10 p-4 rounded-2xl">
          <h2 className="text-lg font-semibold mb-2 text-white">Insight</h2>
          <p className="text-slate-300">{summary}</p>
        </div>

        {/* Emoji Summary */}
        <div className="bg-slate-900/80 border border-white/10 p-4 rounded-2xl">
          <h2 className="text-lg font-semibold mb-2 text-white">Emotions Experienced</h2>
          <div className="flex">
            {emojiStatus.map(({ emoji, experienced }, i) => (
              <span
                key={i}
                className={`text-4xl m-2 transition-opacity ${
                  experienced ? "opacity-100" : "opacity-20"
                }`}
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>

        {/* Emotion Intensity Over Time */}
        <div className="bg-slate-900/80 border border-white/10 p-4 rounded-2xl">
          <h2 className="text-lg font-semibold mb-2 text-white">
            Emotion Intensity Over Time
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={intensityPoints}>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
              />
              <YAxis domain={["dataMin", "dataMax"]} />
              <Tooltip
                labelFormatter={(ts) => new Date(ts).toLocaleString()}
                formatter={(value) => [`${value}`, "Intensity"]}
              />
              <Line
                type="monotone"
                dataKey="intensity"
                stroke="#3182ce"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Emotion Frequency Chart */}
        <div className="bg-slate-900/80 border border-white/10 p-4 rounded-2xl">
          <h2 className="text-lg font-semibold mb-2 text-white">Emotion Frequency</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={freqData}>
              <XAxis dataKey="emotion" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
