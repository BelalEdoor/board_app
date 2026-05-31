import { db } from './firebase'
import { ref, push, onValue, update, remove, get, query, orderByChild, set } from 'firebase/database'

const TTL_MS = 24 * 60 * 60 * 1000
const MAX_USERS = 2

export function subscribeCards(onChange) {
  const cardsRef = query(ref(db, 'cards'), orderByChild('createdAt'))
  const unsub = onValue(cardsRef, snapshot => {
    const now = Date.now()
    const cards = []
    const toDelete = []
    snapshot.forEach(child => {
      const card = { id: child.key, ...child.val() }
      if (now - card.createdAt > TTL_MS) {
        toDelete.push(child.key)
      } else {
        cards.push(card)
      }
    })
    toDelete.forEach(key => remove(ref(db, `cards/${key}`)))
    onChange(cards)
  })
  return unsub
}

// Check if registration is allowed (max 2 users)
export async function canRegister() {
  const snap = await get(ref(db, 'users'))
  if (!snap.exists()) return true
  const count = Object.keys(snap.val()).length
  return count < MAX_USERS
}

// Save user to DB on register
export async function saveUser(uid, name, email) {
  await set(ref(db, `users/${uid}`), { name, email, createdAt: Date.now() })
}

export async function addCard(card) {
  await push(ref(db, 'cards'), {
    ...card,
    createdAt: Date.now(),
    likes: {},
    reactions: {}
  })
}

export async function deleteCard(cardId) {
  await remove(ref(db, `cards/${cardId}`))
}

export async function editCard(cardId, newText) {
  await update(ref(db, `cards/${cardId}`), { text: newText, edited: true })
}

export async function toggleLike(cardId, currentUser) {
  const likeRef = ref(db, `cards/${cardId}/likes/${currentUser}`)
  const snap = await get(likeRef)
  if (snap.exists()) {
    await remove(likeRef)
  } else {
    await update(ref(db, `cards/${cardId}/likes`), { [currentUser]: true })
  }
}

export async function addReaction(cardId, currentUser, emoji) {
  const reactionRef = ref(db, `cards/${cardId}/reactions/${currentUser}`)
  const snap = await get(reactionRef)
  if (snap.exists() && snap.val() === emoji) {
    await remove(reactionRef)
  } else {
    await update(ref(db, `cards/${cardId}/reactions`), { [currentUser]: emoji })
  }
}

export function getTimeLeft(createdAt) {
  const diff = TTL_MS - (Date.now() - createdAt)
  if (diff <= 0) return null
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return `${h}س ${m}د`
}

// Generate a consistent color index for a user based on their uid
// Uses a stronger hash to minimize collisions
const USER_COLORS_COUNT = 12
export function getUserColorIndex(uid) {
  if (!uid) return 0
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57
  for (let i = 0; i < uid.length; i++) {
    const ch = uid.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return ((h2 >>> 0) % USER_COLORS_COUNT)
}

// Group cards by author, sorted newest first
// colorIndex is assigned by first-appearance order to guarantee unique colors per user
export function groupCardsByAuthor(cards) {
  const groups = {}
  const authorOrder = []
  ;[...cards].reverse().forEach(card => {
    const key = card.authorId
    if (!groups[key]) {
      groups[key] = { authorId: key, authorName: card.author, cards: [] }
      authorOrder.push(key)
    }
    groups[key].cards.push(card)
  })
  // Assign colorIndex by appearance order so no two users ever share a color
  return authorOrder.map((key, i) => ({
    ...groups[key],
    colorIndex: i
  }))
}