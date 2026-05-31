import { useState } from 'react'
import { toggleLike, addReaction, getTimeLeft } from '../storage'
import { notifyLike } from '../notifications'
import styles from './Card.module.css'

const CARD_COLORS = [
  { bg: '#FAC775', text: '#412402' }, { bg: '#9FE1CB', text: '#04342C' },
  { bg: '#F4C0D1', text: '#4B1528' }, { bg: '#B5D4F4', text: '#042C53' },
  { bg: '#C0DD97', text: '#173404' }, { bg: '#F5C4B3', text: '#4A1B0C' },
  { bg: '#CECBF6', text: '#26215C' }, { bg: '#D3D1C7', text: '#2C2C2A' },
  { bg: '#F0997B', text: '#4A1B0C' }, { bg: '#85B7EB', text: '#042C53' },
  { bg: '#5DCAA5', text: '#04342C' }, { bg: '#AFA9EC', text: '#26215C' },
]
const ROTATIONS = [-6, -4, -2, 0, 2, 4, 6, -3, 3, -5, 5, 1, -1]
const EMOJIS = ['😂', '🔥', '😮', '😍', '👏', '😢']

export default function Card({ card, index, position, currentUser, currentUserName }) {
  const [showEmojis, setShowEmojis] = useState(false)
  const color = CARD_COLORS[index % CARD_COLORS.length]
  const rot = ROTATIONS[index % ROTATIONS.length]
  const timeLeft = getTimeLeft(card.createdAt)

  const likesObj = card.likes || {}
  const liked = !!likesObj[currentUser]
  const likeCount = Object.keys(likesObj).length

  const reactionsObj = card.reactions || {}
  const myReaction = reactionsObj[currentUser]
  const reactionCounts = Object.values(reactionsObj).reduce((acc, e) => {
    acc[e] = (acc[e] || 0) + 1; return acc
  }, {})

  async function handleLike() {
    await toggleLike(card.id, currentUser)
    // Notify card owner (not self)
    if (!liked && card.authorId && card.authorId !== currentUser) {
      await notifyLike(card.authorId, currentUserName, card.text)
    }
  }

  return (
    <div
      className={styles.card}
      style={{ left: position.x, top: position.y, background: color.bg, color: color.text, transform: `rotate(${rot}deg)`, zIndex: 10 + index }}
    >
      {timeLeft && <div className={styles.timer}>⏱ {timeLeft}</div>}

      {card.media && (
        card.mediaType === 'video'
          ? <video className={styles.media} src={card.media} controls onClick={e => e.stopPropagation()} />
          : <img className={styles.media} src={card.media} alt="صورة" />
      )}

      {card.text && <div className={styles.text}>{card.text}</div>}

      {Object.keys(reactionCounts).length > 0 && (
        <div className={styles.reactionsRow}>
          {Object.entries(reactionCounts).map(([emoji, count]) => (
            <span key={emoji}
              className={`${styles.reactionBadge} ${myReaction === emoji ? styles.myReaction : ''}`}
              onClick={() => addReaction(card.id, currentUser, emoji)}
              style={{ borderColor: color.text + '44', color: color.text }}>
              {emoji} {count}
            </span>
          ))}
        </div>
      )}

      <div className={styles.actions} style={{ borderColor: color.text + '33' }}>
        <button className={`${styles.actionBtn} ${liked ? styles.liked : ''}`} onClick={handleLike} style={{ color: color.text }}>
          {liked ? '❤️' : '🤍'} {likeCount > 0 && <span>{likeCount}</span>}
        </button>
        <div className={styles.emojiWrapper}>
          <button className={`${styles.actionBtn} ${myReaction ? styles.reacted : ''}`} onClick={() => setShowEmojis(v => !v)} style={{ color: color.text }}>
            {myReaction || '😊'}
          </button>
          {showEmojis && (
            <div className={styles.emojiPicker} onClick={e => e.stopPropagation()}>
              {EMOJIS.map(e => (
                <button key={e} className={styles.emojiOption} onClick={() => { addReaction(card.id, currentUser, e); setShowEmojis(false) }}>{e}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.meta}>
        <span className={styles.author}>✦ {card.author}</span>
        <span className={styles.date}><span>{card.date}</span><span>{card.time}</span></span>
      </div>
    </div>
  )
}
