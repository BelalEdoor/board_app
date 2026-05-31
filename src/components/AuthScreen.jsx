import { useState } from 'react'
import { auth } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'
import styles from './AuthScreen.module.css'

export default function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '' })

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    const { email, password } = loginForm
    if (!email || !password) return setError('أدخل الإيميل وكلمة المرور')
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      onLogin({ username: cred.user.uid, name: cred.user.displayName || email })
    } catch (err) {
      setError(getArabicError(err.code))
    }
    setLoading(false)
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    const { name, email, password } = regForm
    if (!name || !email || !password) return setError('كمّل كل الحقول')
    if (password.length < 6) return setError('كلمة المرور لازم تكون 6 حروف على الأقل')
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: name })
      onLogin({ username: cred.user.uid, name })
    } catch (err) {
      setError(getArabicError(err.code))
    }
    setLoading(false)
  }

  function getArabicError(code) {
    const errors = {
      'auth/email-already-in-use': 'الإيميل مستخدم مسبقاً',
      'auth/invalid-email': 'إيميل غير صحيح',
      'auth/wrong-password': 'كلمة المرور غلط',
      'auth/user-not-found': 'المستخدم غير موجود',
      'auth/weak-password': 'كلمة المرور ضعيفة جداً',
      'auth/invalid-credential': 'الإيميل أو كلمة المرور غلط',
      'auth/too-many-requests': 'محاولات كثيرة، جرب بعد شوي',
    }
    return errors[code] || 'حصل خطأ، جرب مرة ثانية'
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.box}>
        <div className={styles.logo}>✦ BŌARD</div>
        <div className={styles.tagline}>شارك أفكارك مع العالم</div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${tab === 'login' ? styles.active : ''}`}
            onClick={() => { setTab('login'); setError('') }}
          >تسجيل الدخول</button>
          <button
            className={`${styles.tabBtn} ${tab === 'register' ? styles.active : ''}`}
            onClick={() => { setTab('register'); setError('') }}
          >إنشاء حساب</button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className={styles.field}>
              <label>الإيميل</label>
              <input
                type="email"
                placeholder="example@email.com"
                value={loginForm.email}
                onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label>كلمة المرور</label>
              <input
                type="password"
                placeholder="أدخل كلمة المرور"
                value={loginForm.password}
                onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
              />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'جاري الدخول...' : 'دخول'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className={styles.field}>
              <label>الاسم الكامل</label>
              <input
                type="text"
                placeholder="اسمك الكامل"
                value={regForm.name}
                onChange={e => setRegForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label>الإيميل</label>
              <input
                type="email"
                placeholder="example@email.com"
                value={regForm.email}
                onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label>كلمة المرور</label>
              <input
                type="password"
                placeholder="6 حروف على الأقل"
                value={regForm.password}
                onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))}
              />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
            </button>
          </form>
        )}

        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  )
}
