import { useState } from "react";
import { useDispatch } from "react-redux";
import { addClock } from "../store/timerSlice";
import { setShowForm } from "../store/uiSlice";

const ClockForm = () => {
  const dispatch = useDispatch();
  const [newClockLabel, setNewClockLabel] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if(hours == 0 && minutes == 0 && seconds == 0){
      alert("entre time");
      return;
    }
    if (hours === "0" && minutes === "0" && seconds === "0") {
      alert("Please enter a valid time");
      return;
    }

    const totalSeconds =
      (parseInt(hours) || 0) * 3600 +
      (parseInt(minutes) || 0) * 60 +
      (parseInt(seconds) || 0);

    if (!newClockLabel || totalSeconds <= 0) return;

    dispatch(addClock({
      label: newClockLabel,
      totalSeconds,
    }));

    setNewClockLabel("");
    setHours("");
    setMinutes("");
    setSeconds("");
    dispatch(setShowForm(false));
  };

  return (
    <div className="bg-gray-700 p-4 rounded shadow-lg mb-4 flex flex-col items-center">
      <form onSubmit={handleSubmit} className="w-full">
        <input
          type="text"
          placeholder="Clock Name"
          className="mb-2 p-2 rounded text-white w-full"
          value={newClockLabel}
          onChange={(e) => setNewClockLabel(e.target.value)}
          required
        />
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            placeholder="HH"
            className="w-16 p-2 rounded text-white"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            min="0"
          />
          <input
            type="number"
            placeholder="MM"
            className="w-16 p-2 rounded text-white"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            min="0"
          />
          <input
            type="number"
            placeholder="SS"
            className="w-16 p-2 rounded text-white"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            min="0"
          />
        </div>
        <div className="mt-2 flex justify-center gap-2">
          <button
            type="submit"
            className="px-3 py-1 bg-green-500 rounded"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => dispatch(setShowForm(false))}
            className="px-3 py-1 bg-red-500 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClockForm; 