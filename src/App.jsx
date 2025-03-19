import { useState, useEffect } from "react";

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
};

const Timer = ({ id, label, initialTime, onRemove, updateClockTime }) => {
  const savedState = JSON.parse(localStorage.getItem(`timer-${id}`)) || {};
  const [timeLeft, setTimeLeft] = useState(
    savedState.remainingTime ?? initialTime
  );
  const [isRunning, setIsRunning] = useState(savedState.isRunning ?? false);
  const [startTime, setStartTime] = useState(savedState.startTime ?? null);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const newTimeLeft = Math.max(0, initialTime - elapsed);
        setTimeLeft(newTimeLeft);
        updateClockTime(id, newTimeLeft);

        if (newTimeLeft === 0) {
          setIsRunning(false);
          playAlertSound();
          clearInterval(interval);
          setTimeout(() => onRemove(id), 2000); // ✅ Ensures removal happens even when tab changes
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning, startTime]);


  useEffect(() => {
    localStorage.setItem(
      `timer-${id}`,
      JSON.stringify({ isRunning, startTime, remainingTime: timeLeft })
    );
  }, [isRunning, startTime, timeLeft]);

  const startTimer = () => {
    if (!isRunning) {
      setStartTime(Date.now() - (initialTime - timeLeft) * 1000);
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
    setStartTime(null);
  };

  const playAlertSound = () => {
    const audio = new Audio("https://www.fesliyanstudios.com/play-mp3/4384");
    audio.play().catch((err) => console.log("Audio playback failed:", err));
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center bg-gray-800 text-white p-4 rounded-xl shadow-lg relative">
      <button
        className="absolute top-2 right-2 text-red-500"
        onClick={() => onRemove(id)}
      >
        ✖
      </button>
      <h2 className="text-xl font-bold mb-2">{label}</h2>
      <div className="text-3xl font-mono">{formatTime(timeLeft)}</div>
      <div className="mt-2 flex gap-2">
        <button
          onClick={startTimer}
          disabled={isRunning}
          className={`px-3 py-1 rounded ${isRunning ? "bg-gray-500" : "bg-green-500"
            }`}
        >
          Start
        </button>
        <button
          onClick={pauseTimer}
          disabled={!isRunning}
          className={`px-3 py-1 rounded ${!isRunning ? "bg-gray-500" : "bg-yellow-500"
            }`}
        >
          Pause
        </button>
        <button onClick={resetTimer} className="px-3 py-1 bg-blue-500 rounded">
          Reset
        </button>
      </div>
    </div>
  );
};

export { Timer };

export default function DigitalClocks() {
  const [clocks, setClocks] = useState([]);
  const [newClockLabel, setNewClockLabel] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState(
    () => localStorage.getItem("activeTab") || "timers"
  );
  const [history, setHistory] = useState(
    () => JSON.parse(localStorage.getItem("history")) || []
  );

  const handleTabChange = (newTab) => {
    setTab(newTab);
    localStorage.setItem("activeTab", newTab);
  };

  useEffect(() => {
    const savedClocks = JSON.parse(localStorage.getItem("clocks")) || [];
    setClocks(savedClocks);
  }, []);

  useEffect(() => {
    localStorage.setItem("clocks", JSON.stringify(clocks));
  }, [clocks]);

  const addClock = () => {
    const totalSeconds =
      (parseInt(hours) || 0) * 3600 +
      (parseInt(minutes) || 0) * 60 +
      (parseInt(seconds) || 0);
    if (!newClockLabel || totalSeconds <= 0) return;
    const newId = Date.now();
    setClocks([
      ...clocks,
      {
        id: newId,
        label: newClockLabel,
        time: totalSeconds,
        initialTime: totalSeconds,
      },
    ]);
    setNewClockLabel("");
    setHours("");
    setMinutes("");
    setSeconds("");
    setShowForm(false);
  };


  const removeClock = (id) => {
    const clockToRemove = clocks.find((clock) => clock.id === id);
    if (clockToRemove) {
      const { label, time, initialTime } = clockToRemove;
      const completedTime = initialTime - time; // Time elapsed
      const percentageCompleted = initialTime > 0
        ? Math.min(100, Math.max(0, ((1 - completedTime / initialTime) * 100).toFixed(2)))
        : 100;

      addToHistory({ label, timeSet: initialTime, percentageCompleted });
    }
    localStorage.removeItem(`timer-${id}`)
    setClocks(clocks.filter((clock) => clock.id !== id));
  };

  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("history")) || [];
    setHistory(savedHistory);
  }, []);

  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  const addToHistory = (entry) => {
    setHistory((prev) => [...prev, { ...entry, id: Date.now() }]);
  };

  const updateClockTime = (id, newTime) => {
    setClocks((prev) =>
      prev.map((clock) =>
        clock.id === id ? { ...clock, time: newTime } : clock
      )
    );
  };

  return (
    <>
      <header className="bg-gray-900 text-white">
        <ul className="flex justify-center gap-4">
          <li
            className={`px-4 py-2 rounded ${tab === "timers" ? "bg-blue-500" : "bg-gray-500"
              }`}
            onClick={() => handleTabChange("timers")}
          >
            Timers
          </li>
          <li
            className={`px-4 py-2 rounded ${tab === "history" ? "bg-blue-500" : "bg-gray-500"
              }`}
            onClick={() => handleTabChange("history")}
          >
            History
          </li>
        </ul>
      </header>
      {tab == "timers" ? (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white">
          <button
            onClick={() => setShowForm(true)}
            className="mb-4 px-4 py-2 bg-blue-500 rounded"
          >
            + Add Clock
          </button>
          {showForm && (
            <div className="bg-gray-700 p-4 rounded shadow-lg mb-4 flex flex-col items-center">
              <input
                type="text"
                placeholder="Clock Name"
                className="mb-2 p-2 rounded text-black"
                value={newClockLabel}
                onChange={(e) => setNewClockLabel(e.target.value)}
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="HH"
                  className="w-16 p-2 rounded text-black"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="MM"
                  className="w-16 p-2 rounded text-black"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="SS"
                  className="w-16 p-2 rounded text-black"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                />
              </div>
              <div className="mt-2">
                <button
                  onClick={addClock}
                  className="px-3 py-1 bg-green-500 rounded"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="ml-2 px-3 py-1 bg-red-500 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div className="flex gap-6 flex-wrap justify-center">
            {clocks.map(({ id, label, time }) => (
              <Timer
                key={id}
                id={id}
                label={label}
                initialTime={time}
                onRemove={removeClock}
                updateClockTime={updateClockTime}
                addToHistory={addToHistory}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-900 h-screen text-white">
          <h2 className="text-xl font-bold mb-4">Completed Timers</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-700">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-700 px-4 py-2">
                    Date
                  </th>
                  <th className="border border-gray-700 px-4 py-2">
                    Clock Name
                  </th>
                  <th className="border border-gray-700 px-4 py-2">
                    Timer Set
                  </th>
                  <th className="border border-gray-700 px-4 py-2">
                    % Completed
                  </th>
                </tr>
              </thead>
              <tbody>
                {history
                  .sort((a, b) => new Date(b.id) - new Date(a.id)) // Sorting in descending order (latest first)
                  .map(({ id, label, timeSet, percentageCompleted }) => (
                    <tr key={id} className="bg-gray-700">
                      <td className="border border-gray-600 px-4 py-2">
                        {new Date(id).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          second: 'numeric',
                          hour12: true
                        })}
                      </td>
                      <td className="border border-gray-600 px-4 py-2">
                        {label}
                      </td>
                      <td className="border border-gray-600 px-4 py-2">
                        {formatTime(timeSet)}
                      </td>
                      <td className="border border-gray-600 px-4 py-2">
                        {percentageCompleted}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
