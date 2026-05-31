import { useState } from 'react'
import { toggleLike, addReaction, deleteCard, editCard, getTimeLeft } from '../storage'
import { notifyLike } from '../notifications'
import styles from './Card.module.css'

const CARD_COLORS = [
  { bg: '#FAC775', text: '#412402' },
  { bg: '#9FE1CB', text: '#04342C' },
  { bg: '#F4C0D1', text: '#4B1528' },
  { bg: '#B5D4F4', text: '#042C53' },
  { bg: '#C0DD97', text: '#173404' },
  { bg: '#CECBF6', text: '#26215C' },
  { bg: '#D3D1C7', text: '#2C2C2A' },
  { bg: '#F0997B', text: '#4A1B0C' },
  { bg: '#85B7EB', text: '#042C53' },
  { bg: '#5DCAA5', text: '#04342C' },
  { bg: '#AFA9EC', text: '#26215C' },
  { bg: '#F5C4B3', text: '#4A1B0C' },
]
const EMOJIS = ['😂', '🔥', '😮', '😍', '👏', '😢']

export default function Card({ card, colorIndex = 0, currentUser, currentUserName }) {
  const [showEmojis, setShowEmojis] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(card.text || '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const color = CARD_COLORS[colorIndex % CARD_COLORS.length]
  const timeLeft = getTimeLeft(card.createdAt)
  const isOwner = card.authorId === currentUser

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
    if (!liked && card.authorId && card.authorId !== currentUser) {
      await notifyLike(card.authorId, currentUserName, card.text)
    }
  }

  async function handleSaveEdit() {
    if (!editText.trim()) return
    await editCard(card.id, editText.trim())
    setEditing(false)
  }

  async function handleDelete() {
    await deleteCard(card.id)
    setConfirmDelete(false)
  }

  return (
    <div className={styles.card} style={{ background: color.bg, color: color.text }}>

      {/* Timer */}
      {timeLeft && <div className={styles.timer}>⏱ {timeLeft}</div>}

      {/* Media */}
      {card.media && (
        card.mediaType === 'video'
          ? <video className={styles.media} src={card.media} controls />
          : <img className={styles.media} src={card.media} alt="صورة" />
      )}

      {/* Text / Edit mode */}
      {editing ? (
        <div className={styles.editArea}>
          <textarea
            className={styles.editInput}
            value={editText}
            onChange={e => setEditText(e.target.value)}
            maxLength={280}
            style={{ color: color.text, borderColor: color.text + '44' }}
          />
          <div className={styles.editActions}>
            <button className={styles.saveBtn} onClick={handleSaveEdit} style={{ background: color.text, color: color.bg }}>حفظ</button>
            <button className={styles.cancelBtn} onClick={() => { setEditing(false); setEditText(card.text || '') }} style={{ borderColor: color.text + '55', color: color.text }}>إلغاء</button>
          </div>
        </div>
      ) : (
        card.text && (
          <div className={styles.text}>
            {card.text}
            {card.edited && <span className={styles.editedTag}> (معدّل)</span>}
          </div>
        )
      )}

      {/* Reactions row */}
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

      {/* Actions */}
      <div className={styles.actions} style={{ borderColor: color.text + '33' }}>
        <button className={`${styles.actionBtn} ${liked ? styles.liked : ''}`} onClick={handleLike} style={{ color: color.text }}>
          {liked ? '❤️' : '🤍'} {likeCount > 0 && <span>{likeCount}</span>}
        </button>

        <div className={styles.emojiWrapper}>
          <button className={`${styles.actionBtn} ${myReaction ? styles.reacted : ''}`} onClick={() => setShowEmojis(v => !v)} style={{ color: color.text }}>
            {myReaction || '😊'}
          </button>
          {showEmojis && (
            <div className={styles.emojiPicker}>
              {EMOJIS.map(e => (
                <button key={e} className={styles.emojiOption} onClick={() => { addReaction(card.id, currentUser, e); setShowEmojis(false) }}>{e}</button>
              ))}
            </div>
          )}
        </div>

        {/* Owner actions */}
        {isOwner && (
          <div className={styles.ownerActions}>
            <button className={styles.actionBtn} onClick={() => setEditing(true)} style={{ color: color.text }} title="تعديل">✏️</button>
            <button className={styles.actionBtn} onClick={() => setConfirmDelete(true)} style={{ color: color.text }} title="حذف">🗑️</button>
          </div>
        )}
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className={styles.confirmDelete} style={{ borderColor: color.text + '33', background: color.bg }}>
          <span style={{ color: color.text, fontSize: 13 }}>تأكيد الحذف؟</span>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <button className={styles.saveBtn} onClick={handleDelete} style={{ background: '#e74c3c', color: '#fff' }}>حذف</button>
            <button className={styles.cancelBtn} onClick={() => setConfirmDelete(false)} style={{ borderColor: color.text + '55', color: color.text }}>إلغاء</button>
          </div>
        </div>
      )}

      {/* Meta */}
      <div className={styles.meta}>
        <span className={styles.author}>✦ {card.author}</span>
        <span className={styles.date}><span>{card.date}</span><span>{card.time}</span></span>
      </div>
    </div>
  )
}