import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";

const PHASES = [
  { label: "Breathe In", duration: 4, color: "from-blue-400 to-cyan-300" },
  { label: "Hold", duration: 4, color: "from-cyan-300 to-teal-400" },
  { label: "Breathe Out", duration: 4, color: "from-teal-400 to-green-300" },
  { label: "Hold", duration: 4, color: "from-green-300 to-blue-400" },
];

const TOTAL_CYCLES = 3;

const Breathing = () => {
  const [active, setActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [countdown, setCountdown] = useState(4);
  const [finished, setFinished] = useState(false);
  const [checkInText, setCheckInText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!active || finished) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setPhaseIndex((pi) => {
            const next = pi + 1;
            if (next >= PHASES.length) {
              setCycle((c) => {
                const nextCycle = c + 1;
                if (nextCycle >= TOTAL_CYCLES) {
                  setActive(false);
                  setFinished(true);
                  clearInterval(timerRef.current);
                  return c;
                }
                return nextCycle;
              });
              return 0;
            }
            return next;
          });
          return PHASES[(phaseIndex + 1) % PHASES.length].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [active, finished, phaseIndex]);

  const startExercise = () => {
    setActive(true);
    setFinished(false);
    setPhaseIndex(0);
    setCycle(0);
    setCountdown(PHASES[0].duration);
    setSubmitted(false);
    setCheckInText("");
  };

  const submitCheckIn = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("data"));
      await axios.post("http://localhost:3000/breathing/complete", {
        email: user?.email,
        feeling: checkInText,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Check-in submit error:", err);
      setSubmitted(true);
    }
  };

  const currentPhase = PHASES[phaseIndex];
  const scale = active
    ? currentPhase.label === "Breathe In"
      ? 1 + ((PHASES[0].duration - countdown) / PHASES[0].duration) * 0.5
      : currentPhase.label === "Breathe Out"
        ? 1.5 - ((PHASES[2].duration - countdown) / PHASES[2].duration) * 0.5
        : currentPhase.label === "Hold" && phaseIndex === 1
          ? 1.5
          : 1
    : 1;

  return (
    <div className="flex flex-row w-full min-h-screen">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Breathing Exercise</h1>
        <p className="text-gray-500 mb-8">Box breathing technique: 4-4-4-4</p>

        {!active && !finished && (
          <button
            onClick={startExercise}
            className="px-8 py-4 bg-blue-500 text-white text-xl rounded-2xl hover:bg-blue-600 transition shadow-lg"
          >
            Begin Exercise
          </button>
        )}

        {active && (
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-400 mb-4">
              Cycle {cycle + 1} of {TOTAL_CYCLES}
            </p>
            <div className="relative flex items-center justify-center w-64 h-64">
              <div
                className={`absolute w-48 h-48 rounded-full bg-gradient-to-br ${currentPhase.color} opacity-30 transition-transform duration-1000`}
                style={{ transform: `scale(${scale * 1.2})` }}
              />
              <div
                className={`w-40 h-40 rounded-full bg-gradient-to-br ${currentPhase.color} flex items-center justify-center shadow-2xl transition-transform duration-1000`}
                style={{ transform: `scale(${scale})` }}
              >
                <div className="text-center">
                  <p className="text-white text-2xl font-bold">{countdown}</p>
                  <p className="text-white/80 text-sm">{currentPhase.label}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {finished && !submitted && (
          <div className="flex flex-col items-center max-w-md w-full">
            <div className="text-6xl mb-4">🌿</div>
            <h2 className="text-2xl font-semibold text-teal-700 mb-2">Great job!</h2>
            <p className="text-gray-600 mb-6 text-center">
              You completed {TOTAL_CYCLES} cycles of box breathing. How do you feel now?
            </p>
            <textarea
              value={checkInText}
              onChange={(e) => setCheckInText(e.target.value)}
              placeholder="I feel..."
              className="w-full p-4 border border-gray-200 rounded-xl mb-4 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
            <div className="flex gap-3 w-full">
              <button
                onClick={submitCheckIn}
                className="flex-1 bg-teal-500 text-white py-3 rounded-xl hover:bg-teal-600 transition"
              >
                Submit
              </button>
              <button
                onClick={startExercise}
                className="flex-1 bg-blue-100 text-blue-700 py-3 rounded-xl hover:bg-blue-200 transition"
              >
                Do Again
              </button>
            </div>
          </div>
        )}

        {submitted && (
          <div className="flex flex-col items-center">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl font-semibold text-teal-700 mb-2">Thank you for checking in</h2>
            <p className="text-gray-500 mb-6">Your response has been recorded.</p>
            <div className="flex gap-3">
              <button
                onClick={startExercise}
                className="bg-blue-100 text-blue-700 px-6 py-3 rounded-xl hover:bg-blue-200 transition"
              >
                Do Again
              </button>
              <button
                onClick={() => navigate("/home")}
                className="bg-teal-500 text-white px-6 py-3 rounded-xl hover:bg-teal-600 transition"
              >
                Back to Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Breathing;
