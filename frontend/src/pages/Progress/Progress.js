import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsJournalText } from "react-icons/bs";
import { FiTarget, FiArrowRightCircle, FiArrowLeft } from "react-icons/fi";
import Navbar from "../../components/Navbar/Navbar";

const cards = [
  {
    title: "Goal Tracker",
    subtitle: "Track daily habits, complete goals, and build consistent wellness streaks.",
    path: "/goals",
    Icon: FiTarget,
    accent: "from-rose-500 to-orange-500",
  },
  {
    title: "Journal",
    subtitle: "Reflect, write, and monitor emotional milestones over time.",
    path: "/journal",
    Icon: BsJournalText,
    accent: "from-indigo-500 to-blue-500",
  },
];

const Progress = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/home"))}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <FiArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">Progress</h1>
            <p className="text-slate-400 mt-2">
              Keep your momentum visible with goals and personal reflection in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card) => (
              <Link
                key={card.title}
                to={card.path}
                className="group bg-slate-900/80 rounded-2xl p-6 border border-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div
                      className={`inline-flex p-3 rounded-xl text-white bg-gradient-to-r ${card.accent}`}
                    >
                      <card.Icon size={22} />
                    </div>
                    <h2 className="text-xl font-semibold text-white mt-4">{card.title}</h2>
                    <p className="text-slate-400 mt-2 leading-relaxed">{card.subtitle}</p>
                  </div>
                  <FiArrowRightCircle
                    size={24}
                    className="text-slate-600 group-hover:text-slate-400 transition-colors mt-1"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
