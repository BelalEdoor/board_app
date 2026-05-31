import { useState, useEffect } from 'react'
import { auth } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import AuthScreen from './components/AuthScreen'
import BoardScreen from './components/BoardScreen'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, firebaseUser => {
      if (firebaseUser) {
        setUser({ username: firebaseUser.uid, name: firebaseUser.displayName || firebaseUser.email })
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  async function handleLogout() {
    await signOut(auth)
    setUser(null)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', fontFamily: 'Tajawal, sans-serif' }}>
      جاري التحميل...
    </div>
  )

  return user
    ? <BoardScreen user={user} onLogout={handleLogout} />
    : <AuthScreen onLogin={setUser} />
}
