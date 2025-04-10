import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  clocks: JSON.parse(localStorage.getItem("clocks")) || [],
  activeTimerId: null,
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
      });
      localStorage.setItem("clocks", JSON.stringify(state.clocks));
    },
    removeClock: (state, action) => {
      const id = action.payload;
      state.clocks = state.clocks.filter(clock => clock.id !== id);
      localStorage.removeItem(`timer-${id}`);
      localStorage.setItem("clocks", JSON.stringify(state.clocks));
    },
    updateClockTime: (state, action) => {
      const { id, newTime } = action.payload;
      const clock = state.clocks.find(c => c.id === id);
      if (clock) {
        clock.time = newTime;
        localStorage.setItem("clocks", JSON.stringify(state.clocks));
      }
    },
    setActiveTimerId: (state, action) => {
      state.activeTimerId = action.payload;
    },
    updateClockState: (state, action) => {
      const { id, isRunning, startTime, remainingTime } = action.payload;
      const clock = state.clocks.find(c => c.id === id);
      if (clock) {
        clock.started = true;
        localStorage.setItem("clocks", JSON.stringify(state.clocks));
        localStorage.setItem(`timer-${id}`, JSON.stringify({ isRunning, startTime, remainingTime }));
      }
    },
    resetAllClocks: (state) => {
      state.clocks = state.clocks.map(clock => ({
        ...clock,
        time: clock.totalTime,
        isRunning: false,
      }));
      localStorage.setItem("clocks", JSON.stringify(state.clocks));
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
} = timerSlice.actions;

export default timerSlice.reducer; 