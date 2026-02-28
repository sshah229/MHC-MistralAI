import React, { useEffect, useState, useRef } from "react";

// Helper to format minutes into human-readable string
const formatFrequency = (mins) => {
  if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''}`;
  if (mins % 60 === 0) {
    const hrs = mins / 60;
    return `${hrs} hr${hrs !== 1 ? 's' : ''}`;
  }
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${hours}h ${minutes}m`;
};

// Frequency options: 1 minute through 3 days in 15-minute increments
const FREQ_OPTIONS = [
  { value: 1, label: '1 min' },
  ...Array.from(
    { length: (3 * 24 * 60) / 15 },
    (_, i) => {
      const m = (i + 1) * 15;
      if (m < 60) return { value: m, label: `${m} min` };
      if (m % 60 === 0) return { value: m, label: `${m / 60} hr` };
      return { value: m, label: `${Math.floor(m / 60)}h ${m % 60}m` };
    }
  )
];

// Notification sound: place notification.mp3 in public folder
const notificationSound = new Audio('/notification.mp3');

const BASE_URL = "http://localhost:3000/goals";
// Hard-coded daily window
const START_HOUR = 9;  // 9 AM
const END_HOUR = 21;   // 9 PM

const GoalTracker = ({ email }) => {
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState("mood_checkin");
  const [newFreq, setNewFreq] = useState(1);

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const remindedRef = useRef(new Set());
  const statsRef = useRef({}); // { [goalId]: { completed: number, missed: number }}

  // Initialize stats for goals
  const initStats = (fetchedGoals) => {
    fetchedGoals.forEach(g => {
      if (!statsRef.current[g._id]) {
        statsRef.current[g._id] = { completed: 0, missed: 0 };
      }
    });
  };

  // Fetch goals from backend
  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/email/${email}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      initStats(list);
      setGoals(list);
    } catch (err) {
      console.error("fetchGoals error:", err);
      setGoals([]);
    }
    setLoading(false);
  };

  // Create a new goal
  const createCustomGoal = async () => {
    if (!newLabel.trim()) return;
    try {
      await fetch(`${BASE_URL}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, label: newLabel, type: newType, frequency: newFreq }),
      });
      fetchGoals();
      setNewLabel("");
      setNewType("mood_checkin");
      setNewFreq(1);
    } catch (err) {
      console.error("createCustomGoal error:", err);
    }
  };

  // Delete a goal
  const handleDelete = async (goalId) => {
    try {
      await fetch(`${BASE_URL}/${goalId}`, { method: 'DELETE' });
      remindedRef.current.delete(goalId);
      delete statsRef.current[goalId];
      fetchGoals();
    } catch (err) {
      console.error('deleteGoal error:', err);
    }
  };

  // Mark a goal complete and schedule UI reset
  const handleComplete = async (goal) => {
    const now = Date.now();
    const lastTs = goal.lastCompleted ? new Date(goal.lastCompleted).getTime() : null;
    const elapsed = lastTs ? (now - lastTs) / 1000 / 60 : Infinity;
    if (lastTs && elapsed < goal.frequency) {
      return alert(
        `You can only mark “${goal.label}” again in ${Math.ceil(goal.frequency - elapsed)} minutes.`
      );
    }
    // Mark complete on server
    await fetch(`${BASE_URL}/complete/${goal._id}`, { method: 'PATCH' });
    // Update stats
    statsRef.current[goal._id].completed += 1;
    // Refresh UI immediately
    fetchGoals();
    // Clear any past reminder flag
    remindedRef.current.delete(goal._id);
    // Schedule a single refresh after `frequency` minutes to reset to undone
    setTimeout(() => {
      fetchGoals();
    }, goal.frequency * 60 * 1000);
  };

  useEffect(() => { fetchGoals(); }, []);

  // Reminder loop: alerts only for overdue (elapsed >= frequency)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      goals.forEach((g) => {
        const lastTs = g.lastCompleted ? new Date(g.lastCompleted).getTime() : new Date(g.createdAt).getTime();
        const elapsed = (now - lastTs) / 1000 / 60;
        if (elapsed >= g.frequency && !remindedRef.current.has(g._id)) {
          // play notification sound
          notificationSound.play().catch(() => {});
          alert(`🔔 "${g.label}" is due! Please mark it done.`);
          remindedRef.current.add(g._id);
          // Update missed count
          statsRef.current[g._id].missed += 1;
        }
      });
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, [goals]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <span className="text-gray-500">Loading your goals…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Custom Goal Form */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Label</label>
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="e.g. Drink Water"
            className="mt-1 w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Type</label>
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="mt-1 w-full border rounded p-2"
          >
            <option value="mood_checkin">Mood Check-In</option>
            <option value="hydration">Hydration</option>
            <option value="journal_streak">Journaling</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Frequency</label>
          <select
            value={newFreq}
            onChange={(e) => setNewFreq(Number(e.target.value))}
            className="mt-1 w-full border rounded p-2"
          >
            {FREQ_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={createCustomGoal}
        className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition"
      >
        + Add Goal
      </button>

      {/* Goals List */}
      {goals.length === 0 ? (
        <p className="text-gray-500">No goals yet. Create one to get started!</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), START_HOUR).getTime();
            const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), END_HOUR).getTime();
            const totalSlots = Math.floor((todayEnd - todayStart) / (goal.frequency * 60 * 1000));
            const stats = statsRef.current[goal._id] || { completed: 0, missed: 0 };
            const lastTs = goal.lastCompleted ? new Date(goal.lastCompleted).getTime() : null;
            const elapsed = lastTs ? (Date.now() - lastTs) / 1000 / 60 : Infinity;
            const completed = lastTs && elapsed < goal.frequency;
            return (
              <li key={goal._id} className="border border-gray-200 p-4 rounded-lg shadow hover:shadow-md transition">
                <p className="text-lg font-semibold text-gray-800">{goal.label}</p>
                <p className="text-sm text-gray-600 capitalize">Type: {goal.type.replace("_", " ")}</p>
                <p className="text-sm text-gray-600">🔁 Frequency: <span className="font-medium">{formatFrequency(goal.frequency)}</span></p>
                <p className="text-sm text-gray-600">📅 Slots (9AM–9PM): <span className="font-medium">{totalSlots}</span></p>
                <p className="text-sm text-gray-600">✅ Completed: <span className="font-semibold">{stats.completed}</span></p>
                <p className="text-sm text-gray-600">❌ Missed: <span className="font-semibold">{stats.missed}</span></p>
                <p className="text-sm text-gray-600">✅ Today: <span className={completed ? 'text-green-600' : 'text-red-500'}>{completed ? 'Yes' : 'No'}</span></p>
                <button
                  onClick={() => handleComplete(goal)}
                  disabled={completed}
                  className={`${completed ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white px-3 py-1 rounded mt-3 transition`}
                >
                  {completed ? '✅ Done' : 'Mark Done'}
                </button>
                <button
                  onClick={() => handleDelete(goal._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ml-2.5 transition"
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default GoalTracker;
