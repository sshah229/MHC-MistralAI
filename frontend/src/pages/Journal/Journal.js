// src/pages/JournalOverview.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";

const emotionEmoji = {
  Happy: "😊",
  Sad: "😢",
  Neutral: "😐",
  Anxious: "😰",
  Angry: "😠",
};

const JournalOverview = () => {
  const navigate = useNavigate();
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [entries, setEntries] = useState([]);

  // Fetch date→emotion summary
  useEffect(() => {
    axios
      .get("http://localhost:3000/journal/dates")
      .then((res) => setDates(res.data))
      .catch((err) => console.error("Failed to load dates:", err));
  }, []);

  // When a date is clicked, fetch journal entries for that date
  useEffect(() => {
    if (!selectedDate) return;
    axios
      .get(`http://localhost:3000/journal/entries/${selectedDate}`)
      .then((res) => setEntries(res.data))
      .catch((err) =>
        console.error(`Failed to load entries for ${selectedDate}:`, err)
      );
  }, [selectedDate]);

  // Show date cards if none selected
  if (!selectedDate) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="w-full p-6">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/progress"))}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-4 transition-colors"
          >
            <FiArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-3xl font-semibold text-slate-200 mb-6">
            Activity by Date
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dates.map(({ date, emotions }) => (
              <div
                key={date}
                onClick={() => setSelectedDate(date)}
                className="cursor-pointer bg-slate-900/80 border border-white/10 rounded-2xl p-5 border-l-4 border-l-teal-500 hover:border-white/20 transition"
              >
                <p className="text-xl font-semibold text-slate-300">{date}</p>
                <div className="mt-3 flex">
                  {emotions.map((cat) => (
                    <span key={cat} className="text-3xl mr-2">
                      {emotionEmoji[cat] || "❓"}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, show journal entries for selectedDate
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="w-full p-6">
        <button
          onClick={() => setSelectedDate(null)}
          className="mb-4 text-sm text-teal-400 hover:text-teal-300 hover:underline"
        >
          ← Back to dates
        </button>
        <h1 className="text-3xl font-semibold text-slate-200 mb-6">
          Journal for {selectedDate}
        </h1>

        {entries.length === 0 ? (
          <p className="text-slate-400">No journal entries for this date.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 border-l-4 border-l-teal-500"
              >
                <p className="text-sm text-slate-400 mb-1">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-300 capitalize">
                  {entry.latest_emotion_category}
                </p>
                <p className="mt-3 text-slate-400">{entry.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalOverview;
