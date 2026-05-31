import { useState, useRef, useEffect } from 'react'
import { addCard, subscribeCards } from '../storage'
import Card from './Card'
import styles from './BoardScreen.module.css'

function computePositions(cards, boardWidth) {
  const cardW = 240
  const cardH = 220
  const marginX = 28
  const marginY = 28
  const topOffset = 70
  const cols = Math.max(1, Math.floor((boardWidth - marginX * 2) / (cardW + marginX)))
  const totalColWidth = cols * (cardW + marginX) - marginX
  const startX = (boardWidth - totalColWidth) / 2

  return cards.map((_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const seed = i * 1337
    const jx = ((seed * 9301 + 49297) % 233280) / 233280 * 28 - 14
    const jy = ((seed * 6271 + 28411) % 134456) / 134456 * 18 - 9
    return {
      x: Math.max(marginX, startX + col * (cardW + marginX) + jx),
      y: Math.max(topOffset, topOffset + row * (cardH + marginY) + jy),
    }
  })
}

const ACCEPTED = 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm'

export default function BoardScreen({ user, onLogout }) {
  const [cards, setCards] = useState([])
  const [text, setText] = useState('')
  const [mediaPreview, setMediaPreview] = useState(null)
  const [mediaData, setMediaData] = useState(null)
  const [boardWidth, setBoardWidth] = useState(800)
  const [publishing, setPublishing] = useState(false)
  const boardRef = useRef(null)
  const fileRef = useRef(null)

  // Subscribe to Firebase realtime updates
  useEffect(() => {
    const unsub = subscribeCards(setCards)
    return () => unsub()
  }, [])

  // Resize observer
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width
      if (w > 0) setBoardWidth(w)
    })
    if (boardRef.current) obs.observe(boardRef.current)
    return () => obs.disconnect()
  }, [])

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    // Warn if file too large (>2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('الملف كبير جداً! الحد الأقصى 2MB للصور و2MB للفيديو')
      return
    }
    const isVideo = file.type.startsWith('video/')
    const reader = new FileReader()
    reader.onload = ev => {
      const src = ev.target.result
      setMediaPreview({ src, type: isVideo ? 'video' : 'image' })
      setMediaData({ data: src, type: isVideo ? 'video' : 'image' })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function removeMedia() {
    setMediaPreview(null)
    setMediaData(null)
  }

  async function publish() {
    if (!text.trim() && !mediaData) return
    setPublishing(true)
    const now = new Date()
    const card = {
      text: text.trim(),
      author: user.name,
      authorId: user.username,
      date: now.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      media: mediaData?.data || null,
      mediaType: mediaData?.type || null,
    }
    await addCard(card)
    setText('')
    setMediaPreview(null)
    setMediaData(null)
    setPublishing(false)
  }

  const positions = computePositions(cards, boardWidth)
  const boardHeight = cards.length === 0
    ? 400
    : Math.max(440, Math.max(...positions.map(p => p.y)) + 300)

  const canPublish = (text.trim() || mediaData) && !publishing

  return (
    <div className={styles.wrapper}>
      <header className={styles.topbar}>
        <div className={styles.logo}>✦ BŌARD</div>
        <div className={styles.right}>
          <span className={styles.pill}>👤 {user.name}</span>
          <button className={styles.logoutBtn} onClick={onLogout}>خروج</button>
        </div>
      </header>

      <div className={styles.composeArea}>
        <div className={styles.composeBox}>
          {mediaPreview && (
            <div className={styles.previewWrap}>
              {mediaPreview.type === 'video'
                ? <video src={mediaPreview.src} className={styles.preview} controls />
                : <img src={mediaPreview.src} className={styles.preview} alt="معاينة" />
              }
              <button className={styles.removeMedia} onClick={removeMedia}>✕</button>
            </div>
          )}
          <textarea
            className={styles.textarea}
            placeholder="اكتب ما يدور في بالك..."
            maxLength={280}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') publish() }}
          />
          <div className={styles.composeFooter}>
            <div className={styles.footerLeft}>
              <button className={styles.mediaBtn} onClick={() => fileRef.current.click()}>
                📎 صورة / فيديو
              </button>
              <input ref={fileRef} type="file" accept={ACCEPTED} style={{ display: 'none' }} onChange={handleFile} />
              <span className={styles.charCount}>{text.length} / 280</span>
            </div>
            <button className={styles.publishBtn} onClick={publish} disabled={!canPublish}>
              {publishing ? 'جاري النشر...' : 'نشر البطاقة'}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.boardStats}>
        {cards.length > 0
          ? `${cards.length} بطاقة نشطة — تختفي بعد 24 ساعة`
          : 'اللوحة فارغة — كن أول من ينشر!'}
      </div>

      <div ref={boardRef} className={styles.board} style={{ minHeight: boardHeight }}>
        {cards.length === 0 && (
          <div className={styles.empty}>
            <span>✦</span>
            <p>لا توجد بطاقات بعد</p>
          </div>
        )}
        {cards.map((card, i) => (
          <Card
            key={card.id}
            card={card}
            index={i}
            position={positions[i] || { x: 20, y: 70 }}
            currentUser={user.username}
          />
        ))}
      </div>
    </div>
  )
}
