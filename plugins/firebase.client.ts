import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'
import { getDatabase, type Database } from 'firebase/database'

export const firebaseConfig = {
  apiKey: "AIzaSyCIvTlTGG115yaWDeFqxi-Jc2oYH45FlME",
  authDomain: "ecni2-2026.firebaseapp.com",
  databaseURL: "https://ecni2-2026-default-rtdb.firebaseio.com",
  projectId: "ecni2-2026",
  storageBucket: "ecni2-2026.firebasestorage.app",
  messagingSenderId: "1046535202867",
  appId: "1:1046535202867:web:a23b26f739647f87221b46"
}

let app: FirebaseApp
let auth: Auth
let database: Database
let googleProvider: GoogleAuthProvider

export default defineNuxtPlugin(() => {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }

  auth = getAuth(app)
  database = getDatabase(app)
  googleProvider = new GoogleAuthProvider()
  googleProvider.setCustomParameters({ prompt: 'select_account' })

  return {
    provide: {
      firebaseApp: app,
      firebaseAuth: auth,
      firebaseDb: database,
      googleProvider
    }
  }
})

export { app, auth, database, googleProvider }
