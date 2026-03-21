import { useRegisterSW } from 'virtual:pwa-register/react';
import { useState, useEffect } from 'react';

const PwaPrompt = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Capture the native install prompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {/* App Install Button */}
      {deferredPrompt && (
        <div className="bg-white dark:bg-gray-800 border border-indigo-500 p-4 rounded-xl shadow-lg flex items-center justify-between gap-4">
          <span className="text-sm font-medium dark:text-white">Install TaskFlow App</span>
          <button 
            onClick={handleInstallClick}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
          >
            Install
          </button>
        </div>
      )}

      {/* App Update Prompt */}
      {needRefresh && (
        <div className="bg-white dark:bg-gray-800 border border-green-500 p-4 rounded-xl shadow-lg">
          <p className="text-sm font-medium mb-3 dark:text-white">
            New update available! Refresh to update.
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => updateServiceWorker(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold"
            >
              Reload
            </button>
            <button 
              onClick={close}
              className="bg-gray-200 dark:bg-gray-700 dark:text-white px-4 py-2 rounded-lg text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PwaPrompt;