import { useState, useEffect } from 'react'
import { addCard, subscribeCards, groupCardsByAuthor } from '../storage'
import { initNotifications, notifyNewCard } from '../notifications'
import CardStack from './CardStack'
import styles from './BoardScreen.module.css'

const ACCEPTED = 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm'

export default function BoardScreen({ user, onLogout }) {
  const [cards, setCards] = useState([])
  const [text, setText] = useState('')
  const [mediaPreview, setMediaPreview] = useState(null)
  const [mediaData, setMediaData] = useState(null)
  const [publishing, setPublishing] = useState(false)
  const [notifEnabled, setNotifEnabled] = useState(false)
  const fileRef = { current: null }

  useEffect(() => {
    const unsub = subscribeCards(setCards)
    return () => unsub()
  }, [])

  useEffect(() => {
    initNotifications(user.username).then(ok => setNotifEnabled(ok))
  }, [user.username])

  function handleFileRef(el) { fileRef.current = el }

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('الحد الأقصى 2MB'); return }
    const isVideo = file.type.startsWith('video/')
    const reader = new FileReader()
    reader.onload = ev => {
      setMediaPreview({ src: ev.target.result, type: isVideo ? 'video' : 'image' })
      setMediaData({ data: ev.target.result, type: isVideo ? 'video' : 'image' })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
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
    await notifyNewCard(user.name, text.trim())
    setText('')
    setMediaPreview(null)
    setMediaData(null)
    setPublishing(false)
  }

  const groups = groupCardsByAuthor(cards)

  return (
    <div className={styles.wrapper}>
      <header className={styles.topbar}>
        <div className={styles.logo}>✦ BŌARD</div>
        <div className={styles.right}>
          <span className={styles.notifStatus}>{notifEnabled ? '🔔' : '🔕'}</span>
          <span className={styles.pill}>👤 {user.name}</span>
          <button className={styles.logoutBtn} onClick={onLogout}>خروج</button>
        </div>
      </header>

      {/* Compose */}
      <div className={styles.composeArea}>
        <div className={styles.composeBox}>
          {mediaPreview && (
            <div className={styles.previewWrap}>
              {mediaPreview.type === 'video'
                ? <video src={mediaPreview.src} className={styles.preview} controls />
                : <img src={mediaPreview.src} className={styles.preview} alt="معاينة" />}
              <button className={styles.removeMedia} onClick={() => { setMediaPreview(null); setMediaData(null) }}>✕</button>
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
              <button className={styles.mediaBtn} onClick={() => fileRef.current?.click()}>📎 صورة / فيديو</button>
              <input ref={handleFileRef} type="file" accept={ACCEPTED} style={{ display: 'none' }} onChange={handleFile} />
              <span className={styles.charCount}>{text.length} / 280</span>
            </div>
            <button className={styles.publishBtn} onClick={publish} disabled={(!text.trim() && !mediaData) || publishing}>
              {publishing ? 'جاري النشر...' : 'نشر البطاقة'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.boardStats}>
        {cards.length > 0
          ? `${cards.length} بطاقة نشطة من ${groups.length} مستخدم — تختفي بعد 24 ساعة`
          : 'اللوحة فارغة — كن أول من ينشر!'}
      </div>

      {/* Stacks */}
      <div className={styles.stacksGrid}>
        {groups.length === 0 && (
          <div className={styles.empty}><span>✦</span><p>لا توجد بطاقات بعد</p></div>
        )}
        {groups.map((group, i) => (
          <CardStack
            key={group.authorId}
            group={group}
            index={i}
            currentUser={user.username}
            currentUserName={user.name}
          />
        ))}
      </div>
    </div>
  )
}