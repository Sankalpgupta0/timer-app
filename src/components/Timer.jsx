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

// Create a background service for timer updates
const timerService = {
  intervals: new Map(),
  updateTimer: (id, dispatch, totalTime, label, setTimeLeft) => {
    if (timerService.intervals.has(id)) return;
    
    const startTime = Date.now();
    const savedState = JSON.parse(localStorage.getItem(`timer-${id}`)) || {};
    const initialRemainingTime = savedState.remainingTime || totalTime;
    
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
      const newTime = Math.max(0, initialRemainingTime - elapsedSeconds);

      // Update both local state and Redux store
      setTimeLeft(newTime);
      dispatch(updateClockTime({ 
        id, 
        newTime,
        lastUpdateTime: currentTime
      }));

      if (newTime === 0) {
        clearInterval(interval);
        timerService.intervals.delete(id);
        
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
        
        const audio = new Audio("https://www.fesliyanstudios.com/play-mp3/4384");
        audio.play().catch((err) => console.log("Audio playback failed:", err));
        setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
        }, 2000);
      } else {
        localStorage.setItem(`timer-${id}`, JSON.stringify({
          isRunning: true,
          startTime,
          remainingTime: newTime,
          lastUpdateTime: currentTime
        }));
      }
    }, 100);

    timerService.intervals.set(id, interval);
  },
  stopTimer: (id) => {
    if (timerService.intervals.has(id)) {
      clearInterval(timerService.intervals.get(id));
      timerService.intervals.delete(id);
    }
  }
};

const Timer = ({ id, label, initialTime, totalTime }) => {
  const dispatch = useDispatch();
  const activeTimerId = useSelector((state) => state.timer.activeTimerId);
  const savedState = JSON.parse(localStorage.getItem(`timer-${id}`)) || {};
  
  const [timeLeft, setTimeLeft] = useState(
    savedState.remainingTime ?? initialTime
  );
  const [isRunning, setIsRunning] = useState(savedState.isRunning ?? false);
  const [startTime, setStartTime] = useState(savedState.startTime ?? null);

  // Update local state when Redux store changes
  useEffect(() => {
    const clock = JSON.parse(localStorage.getItem(`timer-${id}`));
    if (clock) {
      setTimeLeft(clock.remainingTime);
      setIsRunning(clock.isRunning);
      setStartTime(clock.startTime);
    }
  }, [id]);

  useEffect(() => {
    if (isRunning) {
      timerService.updateTimer(id, dispatch, totalTime, label, setTimeLeft);
    } else {
      timerService.stopTimer(id);
    }

    return () => {
      timerService.stopTimer(id);
    };
  }, [isRunning, id, totalTime, label, dispatch]);

  useEffect(() => {
    if (isRunning || startTime || timeLeft !== initialTime) {
      dispatch(updateClockState({ 
        id, 
        isRunning, 
        startTime, 
        remainingTime: timeLeft,
        lastUpdateTime: Date.now()
      }));
    }
  }, [isRunning, startTime, timeLeft, id, initialTime, dispatch]);

  const startTimer = () => {
    if (activeTimerId !== null && activeTimerId !== id) {
      return;
    }
    
    const now = Date.now();
    setStartTime(now);
    setIsRunning(true);
    dispatch(setActiveTimerId(id));
    
    // Initialize timer state
    localStorage.setItem(`timer-${id}`, JSON.stringify({
      isRunning: true,
      startTime: now,
      remainingTime: timeLeft,
      lastUpdateTime: now
    }));
  };

  const pauseTimer = () => {
    setIsRunning(false);
    dispatch(setActiveTimerId(null));
    
    // Update timer state
    const savedState = JSON.parse(localStorage.getItem(`timer-${id}`)) || {};
    localStorage.setItem(`timer-${id}`, JSON.stringify({
      ...savedState,
      isRunning: false,
      lastUpdateTime: Date.now()
    }));
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
    const timeSpent = totalTime - timeLeft;
    let percentageCompleted;

    if (timeLeft === totalTime) {
      percentageCompleted = "0";
    } else if (timeLeft === 0) {
      percentageCompleted = "100";
    } else {
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