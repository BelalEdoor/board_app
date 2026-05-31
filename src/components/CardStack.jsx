import { useState } from 'react'
import Card from './Card'
import styles from './CardStack.module.css'

const STACK_COLORS = [
  { bg: '#FAC775', text: '#412402' },
  { bg: '#9FE1CB', text: '#04342C' },
  { bg: '#F4C0D1', text: '#4B1528' },
  { bg: '#B5D4F4', text: '#042C53' },
  { bg: '#C0DD97', text: '#173404' },
  { bg: '#CECBF6', text: '#26215C' },
]

export default function CardStack({ group, index, currentUser, currentUserName }) {
  const [expanded, setExpanded] = useState(false)
  const color = STACK_COLORS[index % STACK_COLORS.length]
  const count = group.cards.length

  return (
    <div className={styles.wrapper}>
      {!expanded ? (
        // Stacked view
        <div className={styles.stackContainer} onClick={() => setExpanded(true)}>
          {/* Shadow cards behind */}
          {count >= 3 && (
            <div className={styles.shadowCard3} style={{ background: color.bg, opacity: 0.4 }} />
          )}
          {count >= 2 && (
            <div className={styles.shadowCard2} style={{ background: color.bg, opacity: 0.65 }} />
          )}
          {/* Main top card */}
          <div className={styles.topCard} style={{ background: color.bg, color: color.text }}>
            <div className={styles.stackAuthor}>✦ {group.authorName}</div>
            <div className={styles.stackPreview}>
              {group.cards[0].media
                ? <span>📎 {group.cards[0].text || 'وسائط'}</span>
                : <span>{group.cards[0].text?.slice(0, 80) || '...'}</span>
              }
            </div>
            <div className={styles.stackFooter}>
              <span className={styles.stackCount}>{count} بطاقة</span>
              <span className={styles.expandHint}>اضغط للفتح ↓</span>
            </div>
          </div>
        </div>
      ) : (
        // Expanded grid view
        <div className={styles.expandedWrapper}>
          <div className={styles.expandedHeader} style={{ borderColor: color.bg }}>
            <span style={{ color: color.text, background: color.bg }} className={styles.expandedName}>
              ✦ {group.authorName} — {count} بطاقة
            </span>
            <button className={styles.collapseBtn} onClick={() => setExpanded(false)}>✕ طي</button>
          </div>
          <div className={styles.grid}>
            {group.cards.map((card, i) => (
              <Card
                key={card.id}
                card={card}
                colorIndex={index}
                currentUser={currentUser}
                currentUserName={currentUserName}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}