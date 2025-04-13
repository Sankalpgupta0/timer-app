import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  clocks: JSON.parse(localStorage.getItem("clocks")) || [],
  activeTimerId: JSON.parse(localStorage.getItem("activeTimerId")) || null,
};

export const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    addClock: (state, action) => {
      const { label, totalSeconds } = action.payload;
      const newId = Date.now();
      state.clocks.push({
        id: newId,
        label,
        time: totalSeconds,
        totalTime: totalSeconds,
        started: false,
        startTime: null,
        lastUpdateTime: null,
      });
      localStorage.setItem("clocks", JSON.stringify(state.clocks));
    },
    removeClock: (state, action) => {
      const id = action.payload;
      state.clocks = state.clocks.filter(clock => clock.id !== id);
      localStorage.removeItem(`timer-${id}`);
      localStorage.setItem("clocks", JSON.stringify(state.clocks));
      
      if (state.activeTimerId === id) {
        state.activeTimerId = null;
        localStorage.removeItem("activeTimerId");
      }
    },
    updateClockTime: (state, action) => {
      const { id, newTime, lastUpdateTime } = action.payload;
      const clock = state.clocks.find(c => c.id === id);
      if (clock) {
        clock.time = newTime;
        if (lastUpdateTime) {
          clock.lastUpdateTime = lastUpdateTime;
        }
        localStorage.setItem("clocks", JSON.stringify(state.clocks));
      }
    },
    setActiveTimerId: (state, action) => {
      state.activeTimerId = action.payload;
      if (action.payload) {
        localStorage.setItem("activeTimerId", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("activeTimerId");
      }
    },
    updateClockState: (state, action) => {
      const { id, isRunning, startTime, remainingTime, lastUpdateTime } = action.payload;
      const clock = state.clocks.find(c => c.id === id);
      if (clock) {
        clock.started = isRunning;
        clock.startTime = startTime;
        clock.time = remainingTime;
        clock.lastUpdateTime = lastUpdateTime;
        localStorage.setItem("clocks", JSON.stringify(state.clocks));
        localStorage.setItem(`timer-${id}`, JSON.stringify({ 
          isRunning, 
          startTime, 
          remainingTime,
          lastUpdateTime 
        }));
      }
    },
    resetAllClocks: (state) => {
      state.clocks = state.clocks.map(clock => ({
        ...clock,
        time: clock.totalTime,
        started: false,
        startTime: null,
        lastUpdateTime: null,
      }));
      state.activeTimerId = null;
      localStorage.setItem("clocks", JSON.stringify(state.clocks));
      localStorage.removeItem("activeTimerId");
    },
    midnightReset: (state) => {
      const currentClocks = [...state.clocks];
      state.clocks = [];
      state.activeTimerId = null;
      localStorage.setItem("clocks", JSON.stringify([]));
      localStorage.removeItem("activeTimerId");
      return currentClocks;
    }
  },
});

export const {
  addClock,
  removeClock,
  updateClockTime,
  setActiveTimerId,
  updateClockState,
  resetAllClocks,
  midnightReset,
} = timerSlice.actions;

export default timerSlice.reducer; 