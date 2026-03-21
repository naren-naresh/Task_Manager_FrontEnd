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
    const registration = await navigator.serviceWorker.ready;
    
    // 1. Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // 2. Request Subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VapidPublicKey)
      });
    }

    // 3. Send subscription to backend
    await apiClient.post('/notifications/subscribe', subscription.toJSON());
    console.log('[Push] Subscribed successfully');
  } catch (error) {
    console.error('[Push] Subscription failed:', error);
  }
};