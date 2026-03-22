import { apiClient } from '../services/api';

const VapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

export const subscribeToNotifications = async () => {
  try {
    // console.log('[Push] 1. Waiting for Service Worker to be ready...');

    // Use .ready instead of getRegistration for better reliability
    const registration = await navigator.serviceWorker.ready;

    if (!registration.pushManager) {
      throw new Error('Push Manager is not supported by this browser/worker.');
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
    });

    
    // Ensure this path matches your WORKING APIs exactly
    // If your auth APIs use /api/auth, this MUST use /api/notifications
    await apiClient.post('/notifications/subscribe', subscription.toJSON());
    
    alert("Notifications enabled!");

  } catch (error) {
    console.error('[Push] Subscription flow failed:', error);
    alert(`Subscription Error: ${error.message}`);
  }
};