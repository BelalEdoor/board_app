import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const VAPID_KEY = 'BF6dWb-PKyptZj0Bq_BqoiAHi1r77iT6821cbTkjxNs2SdLjKKyso82m9Yms8qQmPS86lg3lqmx9kAFBoaqW8Sg'
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://board-backend-2-i2t6.onrender.com'

export async function initNotifications(userId) {
  try {
    if (!('Notification' in window)) return false
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return false

    const messaging = getMessaging()

    // Register SW manually with correct path for GitHub Pages subdirectory
    const swReg = await navigator.serviceWorker.register('/board_app/firebase-messaging-sw.js', {
      scope: '/board_app/'
    })

    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg })

    if (token) {
      await fetch(`${BACKEND_URL}/register-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token })
      })
    }

    // Show foreground notifications
    onMessage(messaging, (payload) => {
      const { title, body } = payload.notification
      new Notification(title, { body, icon: '/board_app/icon-192.png' })
    })

    return true
  } catch (err) {
    console.error('FCM init error:', err)
    return false
  }
}

export async function notifyNewCard(authorName, cardText) {
  try {
    await fetch(`${BACKEND_URL}/notify-card`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName, cardText })
    })
  } catch (err) {
    console.error('notify card error:', err)
  }
}

export async function notifyLike(cardAuthorId, likerName, cardText) {
  try {
    await fetch(`${BACKEND_URL}/notify-like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardAuthorId, likerName, cardText })
    })
  } catch (err) {
    console.error('notify like error:', err)
  }
}