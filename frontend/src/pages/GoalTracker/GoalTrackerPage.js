import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import GoalTracker from "./GoalTracker";
import Navbar from "../../components/Navbar/Navbar";

const GoalTrackerPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("data"));
  const email = user?.email;

  return (
    <div className="flex flex-row w-full">
      <Navbar />
      <div className="w-full p-6 space-y-6 bg-gray-50 min-h-screen">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/progress"))}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <FiArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>
        {/* Header */}
        <div className="bg-green-100 p-4 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-green-800">
            Your Daily Goal Tracker 🏁
          </h1>
          <p className="text-green-900 mt-1 text-sm">
            Stay consistent with small wins — track habits and build streaks.
          </p>
        </div>

        {/* Main Goal Tracker */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Active Routine Goals
          </h2>
          {email ? (
            <GoalTracker email={email} />
          ) : (
            <p className="text-red-500">Please log in to view your goals.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalTrackerPage;
