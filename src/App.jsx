import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Timer from "./components/Timer";
import History from "./components/History";
import ClockForm from "./components/ClockForm";
import { resetAllClocks } from "./store/timerSlice";
import { setActiveTab, setShowForm } from "./store/uiSlice";

export default function DigitalClocks() {
  const dispatch = useDispatch();
  const clocks = useSelector((state) => state.timer.clocks);
  const activeTab = useSelector((state) => state.ui.activeTab);
  const showForm = useSelector((state) => state.ui.showForm);

  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      const lastReset = localStorage.getItem("lastResetDate");
      const today = now.toISOString().split("T")[0];

      if (
        lastReset !== today &&
        now.getHours() === 0 &&
        now.getMinutes() === 0
      ) {
        dispatch(resetAllClocks());
        localStorage.setItem("lastResetDate", today);
      }
    };

    const interval = setInterval(checkMidnight, 60 * 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <>
      <header className="bg-gray-900 p-4 h-[60px] text-white">
        <ul className="flex justify-center gap-4">
          <li
            className={`cursor-pointer px-4 py-2 rounded ${
              activeTab === "timers" ? "bg-blue-500" : "bg-gray-500"
            }`}
            onClick={() => dispatch(setActiveTab("timers"))}
          >
            Timers
          </li>
          <li
            className={`cursor-pointer px-4 py-2 rounded ${
              activeTab === "history" ? "bg-blue-500" : "bg-gray-500"
            }`}
            onClick={() => dispatch(setActiveTab("history"))}
          >
            History
          </li>
        </ul>
      </header>
      {activeTab === "timers" ? (
        <div className="relative flex flex-col justify-center items-center h-[calc(100vh-60px)] bg-gray-900 text-white">
          <h1 className="text-gray-400 absolute top-0 p-5 text-3xl font-mono">
            DON'T QUIT, SUFFER NOW AND LIVE THE REST OF YOUR LIFE AS A CHAMPION
          </h1>
          <p className="text-gray-500">Don't delete clocks !!! keep it running</p>
          <button
            onClick={() => dispatch(setShowForm(true))}
            className="mb-4 px-4 py-2 bg-blue-500 rounded cursor-pointer"
          >
            + Add Clock
          </button>
          {showForm && <ClockForm />}
          <div className="flex gap-6 flex-wrap justify-center">
            {clocks.map(({ id, label, time, totalTime }) => (
              <Timer
                key={id}
                id={id}
                label={label}
                initialTime={time}
                totalTime={totalTime}
              />
            ))}
          </div>
        </div>
      ) : (
        <History />
      )}
    </>
  );
}
