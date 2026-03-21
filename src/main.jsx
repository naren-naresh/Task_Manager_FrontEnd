import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store.js';
import App from './App.jsx';
import './index.css';
import { initSyncManager } from './services/syncManager.js';

// Initialize the Sync Manager to listen for 'online' events
initSyncManager();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW Registered!', reg))
      .catch(err => console.log('SW Register Error:', err));
  });
}