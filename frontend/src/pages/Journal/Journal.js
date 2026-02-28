// src/pages/JournalOverview.jsx
import { useState, useEffect } from "react";
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
      <div className="flex flex-row w-full">
        <Navbar />
        <div className="w-full p-6">
          <h1 className="text-3xl font-semibold text-teal-800 mb-6">
            Activity by Date
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dates.map(({ date, emotions }) => (
              <div
                key={date}
                onClick={() => setSelectedDate(date)}
                className="cursor-pointer bg-white p-5 rounded-2xl shadow-md border-l-4 border-teal-500 hover:shadow-lg transition"
              >
                <p className="text-xl font-semibold text-gray-700">{date}</p>
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
    <div className="flex flex-row w-full">
      <Navbar />
      <div className="w-full p-6">
        <button
          onClick={() => setSelectedDate(null)}
          className="mb-4 text-sm text-blue-600 hover:underline"
        >
          ← Back to dates
        </button>
        <h1 className="text-3xl font-semibold text-teal-800 mb-6">
          Journal for {selectedDate}
        </h1>

        {entries.length === 0 ? (
          <p className="text-gray-600">No journal entries for this date.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-teal-500"
              >
                <p className="text-sm text-gray-500 mb-1">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </p>
                <p className="mt-1 text-lg font-semibold text-teal-700 capitalize">
                  {entry.latest_emotion_category}
                </p>
                <p className="mt-3 text-gray-700">{entry.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalOverview;
