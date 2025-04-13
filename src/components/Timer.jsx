import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatTime } from "../utils";
import {
  updateClockTime,
  setActiveTimerId,
  updateClockState,
  removeClock,
} from "../store/timerSlice";
import { addHistoryEntry } from "../store/historySlice";

const Timer = ({ id, label, initialTime, totalTime }) => {
  const dispatch = useDispatch();
  const activeTimerId = useSelector((state) => state.timer.activeTimerId);
  const savedState = JSON.parse(localStorage.getItem(`timer-${id}`)) || {};
  const intervalRef = useRef(null);
  
  const [timeLeft, setTimeLeft] = useState(
    savedState.remainingTime ?? initialTime
  );
  const [isRunning, setIsRunning] = useState(savedState.isRunning ?? false);
  const [startTime, setStartTime] = useState(savedState.startTime ?? null);

  useEffect(() => {
    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      const startTimestamp = Date.now();
      const initialElapsed = startTime ? Math.floor((startTimestamp - startTime) / 1000) : 0;
      
      intervalRef.current = setInterval(() => {
        const currentTimestamp = Date.now();
        const elapsed = Math.floor((currentTimestamp - startTimestamp) / 1000) + initialElapsed;
        const newTimeLeft = Math.max(0, initialTime - elapsed);
        
        setTimeLeft(newTimeLeft);
        dispatch(updateClockTime({ id, newTime: newTimeLeft }));

        if (newTimeLeft === 0) {
          setIsRunning(false);
          playAlertSound();
          clearInterval(intervalRef.current);
          
          // When timer completes, it means 100% completion
          dispatch(addHistoryEntry({
            id: Date.now(),
            label,
            timeSet: totalTime,
            timeSpent: totalTime,
            percentageCompleted: "100",
          }));
          
          setTimeout(() => {
            dispatch(removeClock(id));
            localStorage.removeItem(`timer-${id}`);
          }, 2000);
        }
      }, 1000); // Changed to 1000ms for more accurate timing

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isRunning, startTime, id, initialTime, totalTime, label, dispatch]);

  useEffect(() => {
    if (isRunning || startTime || timeLeft !== initialTime) {
      dispatch(updateClockState({ id, isRunning, startTime, remainingTime: timeLeft }));
    }
  }, [isRunning, startTime, timeLeft, id, initialTime, dispatch]);

  const startTimer = () => {
    // If another timer is running, don't allow starting this one
    if (activeTimerId !== null && activeTimerId !== id) {
      return;
    }
    
    setStartTime(Date.now() - (initialTime - timeLeft) * 1000);
    setIsRunning(true);
    dispatch(setActiveTimerId(id));
  };

  const pauseTimer = () => {
    setIsRunning(false);
    dispatch(setActiveTimerId(null));
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalTime);
    setStartTime(null);
    if (activeTimerId === id) dispatch(setActiveTimerId(null));
    dispatch(updateClockTime({ id, newTime: totalTime }));
    localStorage.removeItem(`timer-${id}`);
  };

  const handleRemove = () => {
    // Calculate time spent
    const timeSpent = totalTime - timeLeft;
    let percentageCompleted;

    if (timeLeft === totalTime) {
      // If timer wasn't started or was reset
      percentageCompleted = "0";
    } else if (timeLeft === 0) {
      // If timer completed
      percentageCompleted = "100";
    } else {
      // Calculate actual percentage based on time spent
      percentageCompleted = ((timeSpent / totalTime) * 100).toFixed(2);
    }

    dispatch(addHistoryEntry({
      id: Date.now(),
      label,
      timeSet: totalTime,
      timeSpent: timeSpent > 0 ? timeSpent : 0,
      percentageCompleted,
    }));
    
    dispatch(removeClock(id));
    localStorage.removeItem(`timer-${id}`);
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
        onClick={handleRemove}
      >
        ✖
      </button>
      <h2 className="text-xl font-bold mb-2">{label}</h2>
      <div className="text-3xl font-mono">{formatTime(timeLeft)}</div>
      <div className="mt-2 flex gap-2">
        <button
          onClick={startTimer}
          disabled={isRunning || (activeTimerId !== null && activeTimerId !== id)}
          className={`cursor-pointer px-3 py-1 rounded ${
            isRunning || (activeTimerId !== null && activeTimerId !== id) ? "bg-gray-500" : "bg-green-500"
          }`}
        >
          Start
        </button>
        <button
          onClick={pauseTimer}
          disabled={!isRunning}
          className={`cursor-pointer px-3 py-1 rounded ${
            !isRunning ? "bg-gray-500" : "bg-yellow-500"
          }`}
        >
          Pause
        </button>
        <button
          onClick={resetTimer}
          className="cursor-pointer px-3 py-1 bg-blue-500 rounded"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Timer; 