import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

const emotionColors = {
  Happy: "#10b981",
  Sad: "#3b82f6",
  Anxious: "#f59e0b",
  Angry: "#ef4444",
  Neutral: "#6b7280",
};

const SoulReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("data") || "{}");

  useEffect(() => {
    if (!user?.email) {
      setError("No user email found");
      setLoading(false);
      return;
    }
    axios
      .get(`http://localhost:3000/report/weekly?email=${encodeURIComponent(user.email)}`)
      .then(({ data }) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load weekly report:", err);
        setError("Could not generate your weekly report.");
        setLoading(false);
      });
  }, [user?.email]);

  if (loading) {
    return (
      <div className="flex flex-row w-full min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-xl text-gray-500">Generating your soul report...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-row w-full min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  const freqData = report?.stats?.emotionCounts
    ? Object.entries(report.stats.emotionCounts).map(([emotion, count]) => ({ emotion, count }))
    : [];

  const timelineData = report?.emotionTimeline?.map((e) => ({
    ...e,
    time: new Date(e.timestamp).toLocaleDateString(),
  })) || [];

  return (
    <div className="flex flex-row w-full min-h-screen">
      <Navbar />
      <div className="flex-1 p-8 bg-gradient-to-br from-purple-50 to-indigo-50 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-purple-800">Weekly Soul Report</h1>
            <p className="text-gray-500 mt-1">Your emotional journey over the past 7 days</p>
          </div>

          {report?.headline && (
            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
              <p className="text-xl text-purple-800 font-medium">{report.headline}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm text-center">
              <p className="text-3xl font-bold text-blue-600">{report?.stats?.totalLogs || 0}</p>
              <p className="text-gray-500 text-sm mt-1">Emotion Logs</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm text-center">
              <p className="text-3xl font-bold text-purple-600">{report?.stats?.avgIntensity || 0}</p>
              <p className="text-gray-500 text-sm mt-1">Avg Intensity</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm text-center">
              <p className="text-3xl font-bold text-teal-600">
                {report?.stats?.topEmotion || "N/A"}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Most Frequent ({report?.stats?.topEmotionCount || 0}x)
              </p>
            </div>
          </div>

          {timelineData.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Emotion Intensity Over the Week</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timelineData}>
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="intensity" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {freqData.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Emotion Frequency</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={freqData}>
                  <XAxis dataKey="emotion" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" barSize={40} fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {report?.insights?.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Insights</h2>
              <ul className="space-y-2">
                {report.insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-gray-700">{insight}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report?.affirmations?.length > 0 && (
            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-3 text-purple-800">Your Affirmations</h2>
              <div className="space-y-3">
                {report.affirmations.map((aff, i) => (
                  <p key={i} className="text-purple-700 text-lg italic">"{aff}"</p>
                ))}
              </div>
            </div>
          )}

          {report?.tip && (
            <div className="bg-teal-50 rounded-xl p-6 shadow-sm border-l-4 border-teal-500">
              <h2 className="text-lg font-semibold mb-2 text-teal-800">Tip for Next Week</h2>
              <p className="text-teal-700">{report.tip}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoulReport;
