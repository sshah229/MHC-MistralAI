import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../../components/Navbar/Navbar";
import YouTubePlayer from "react-player/youtube";
import ProgressBar from "@ramonak/react-progress-bar";
import { TiTick } from "react-icons/ti";
import { FiArrowLeft, FiExternalLink, FiPlay } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function extractVideoId(url) {
  try {
    if (url.includes("shorts/")) return url.split("shorts/")[1].split(/[?&]/)[0];
    const u = new URL(url);
    return u.searchParams.get("v") || u.pathname.split("/").pop();
  } catch {
    return null;
  }
}

function VideoCard({ d, index, done, onMarkDone }) {
  const [embedError, setEmbedError] = useState(false);
  const videoId = extractVideoId(d.link);
  const thumbnail = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
        {!embedError ? (
          <YouTubePlayer
            url={d.link}
            controls
            width="100%"
            height="100%"
            style={{ position: "absolute", top: 0, left: 0 }}
            onError={() => setEmbedError(true)}
          />
        ) : (
          <a
            href={d.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full relative group"
          >
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={d.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                <span className="text-slate-400">Video unavailable</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
              <div className="bg-white/90 rounded-full p-3">
                <FiPlay size={28} className="text-red-600 ml-0.5" />
              </div>
            </div>
            <span className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
              <FiExternalLink size={12} /> Open on YouTube
            </span>
          </a>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h2 className="font-semibold text-slate-800 line-clamp-2 leading-snug">
          {d.title}
        </h2>

        <div className="flex items-center justify-between mt-auto pt-3">
          <a
            href={d.channel_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-red-700 hover:text-red-900 truncate max-w-[60%]"
          >
            {d.channel}
          </a>

          {done ? (
            <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
              <TiTick size={18} /> Done
            </span>
          ) : (
            <button
              onClick={() => onMarkDone(index)}
              className="flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <TiTick size={18} /> Mark done
            </button>
          )}
        </div>

        {!embedError && (
          <a
            href={d.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
          >
            <FiExternalLink size={11} /> Open on YouTube
          </a>
        )}
      </div>
    </div>
  );
}

const Plans = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [done, setDone] = useState([]);
  const completedCount = done.filter(Boolean).length;

  const getPlans = useCallback(async () => {
    try {
      const stored = localStorage.getItem("data");
      if (!stored) return;
      const { email } = JSON.parse(stored);
      const res = await axios.post("http://localhost:3000/plans", { email });
      setData(res.data || []);
      setDone(new Array((res.data || []).length).fill(false));
    } catch (err) {
      console.error("Failed to load plans", err);
    }
  }, []);

  useEffect(() => {
    getPlans();
  }, [getPlans]);

  const handleMarkDone = (index) => {
    setDone((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  const progress = data.length > 0 ? Math.round((completedCount / data.length) * 100) : 0;

  return (
    <div className="flex flex-row w-full min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex-1 overflow-y-auto">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-6 text-white">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/activities"))}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors"
          >
            <FiArrowLeft size={16} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-3xl font-bold">Personalized Plans</h1>
          <p className="text-white/80 mt-1">Videos curated just for you — watch and track your progress.</p>
        </div>

        <div className="px-8 py-6">
          <div className="max-w-xl mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">
                Progress: {completedCount} / {data.length} completed
              </span>
              <span className="text-sm font-semibold text-teal-700">{progress}%</span>
            </div>
            <ProgressBar
              completed={progress}
              bgColor="#0d9488"
              height="10px"
              isLabelVisible={false}
              baseBgColor="#e2e8f0"
              borderRadius="999px"
            />
          </div>

          {data.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {data.map((d, index) => (
                <VideoCard
                  key={index}
                  d={d}
                  index={index}
                  done={done[index]}
                  onMarkDone={handleMarkDone}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Plans;
