import { db } from './firebase'
import { ref, push, onValue, update, remove, get, query, orderByChild } from 'firebase/database'

const TTL_MS = 24 * 60 * 60 * 1000

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

export async function addCard(card) {
  await push(ref(db, 'cards'), {
    ...card,
    createdAt: Date.now(),
    likes: {},
    reactions: {}
  })
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
