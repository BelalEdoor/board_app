import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyCyX2BfJq0LE6zx-KplMTjdGlyUsMAktcM",
  authDomain: "board-app-cc85f.firebaseapp.com",
  databaseURL: "https://board-app-cc85f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "board-app-cc85f",
  storageBucket: "board-app-cc85f.firebasestorage.app",
  messagingSenderId: "903369317017",
  appId: "1:903369317017:web:70aefd28d9371d146b3608"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getDatabase(app)
