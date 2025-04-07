import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTab: localStorage.getItem("activeTab") || "timers",
  showForm: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
      localStorage.setItem("activeTab", action.payload);
    },
    setShowForm: (state, action) => {
      state.showForm = action.payload;
    },
  },
});

export const { setActiveTab, setShowForm } = uiSlice.actions;

export default uiSlice.reducer; 