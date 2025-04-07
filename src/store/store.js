import { configureStore } from '@reduxjs/toolkit';
import timerReducer from './timerSlice';
import historyReducer from './historySlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    timer: timerReducer,
    history: historyReducer,
    ui: uiReducer,
  },
}); 