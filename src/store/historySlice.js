import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  entries: JSON.parse(localStorage.getItem("history")) || [],
};

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addHistoryEntry: (state, action) => {
      const newEntry = action.payload;
      const existingEntryIndex = state.entries.findIndex(
        e => e.label.trim().toLowerCase() === newEntry.label.trim().toLowerCase()
      );
      // console.log("new entry date : ", newEntry)
      // console.log("prev entry date : ", state.entries[existingEntryIndex].id)


      if (existingEntryIndex !== -1) {
        const date1 = new Date(Date.now());
        const date2 = new Date(state.entries[existingEntryIndex].id);

        const sameDate =
          date1.getFullYear() === date2.getFullYear() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getDate() === date2.getDate();

        if (sameDate) {
          const existingEntry = state.entries[existingEntryIndex];

          const totalTimeSet = existingEntry.timeSet + newEntry.timeSet;
          const totalTimeSpent = (existingEntry.timeSpent || 0) + (newEntry.timeSpent || 0);
          const weightedPercentage = ((totalTimeSpent * 100) / totalTimeSet).toFixed(2);

          const updatedEntry = {
            ...newEntry,
            id: Date.now(),
            timeSet: totalTimeSet,
            timeSpent: totalTimeSpent,
            percentageCompleted: weightedPercentage,
          };

          state.entries.splice(existingEntryIndex, 1);
          state.entries.push(updatedEntry);
        } else {
          // Different date — add as new entry
          state.entries.push({
            ...newEntry,
            id: Date.now(),
            timeSpent: newEntry.timeSpent || 0,
          });
        }

      } else {
        // If no existing entry, just add the new one
        state.entries.push({
          ...newEntry,
          id: Date.now(),
          timeSpent: newEntry.timeSpent || 0,
        });
      }

      localStorage.setItem("history", JSON.stringify(state.entries));
    },
  },
});

export const { addHistoryEntry } = historySlice.actions;

export default historySlice.reducer; 