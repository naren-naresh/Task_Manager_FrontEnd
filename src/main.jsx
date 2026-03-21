import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store.js';
import App from './App.jsx';
import './index.css';
import { initSyncManager } from './services/syncManager.js';

// 1. Initialize Sync Logic
initSyncManager();

// 2. Render App
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// NOTE: Manual SW registration is removed. 
// Vite-plugin-pwa handles this automatically in the build step.