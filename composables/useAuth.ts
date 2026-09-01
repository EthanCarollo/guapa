import { ref, onMounted } from 'vue'
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  type User, 
  type Auth,
  GoogleAuthProvider
} from 'firebase/auth'

export function useAuth() {
  const user = useState<User | null>('firebase_user', () => null)
  const loading = useState<boolean>('firebase_auth_loading', () => true)
  const authError = useState<string | null>('firebase_auth_error', () => null)

  const initAuth = () => {
    if (import.meta.client) {
      const { $firebaseAuth } = useNuxtApp()
      if ($firebaseAuth) {
        onAuthStateChanged($firebaseAuth as Auth, (currentUser) => {
          user.value = currentUser
          loading.value = false
        })
      } else {
        loading.value = false
      }
    }
  }

  const loginWithGoogle = async () => {
    if (!import.meta.client) return
    authError.value = null
    loading.value = true

    try {
      const { $firebaseAuth, $googleProvider } = useNuxtApp()
      const result = await signInWithPopup($firebaseAuth as Auth, $googleProvider as GoogleAuthProvider)
      user.value = result.user
      return result.user
    } catch (err: any) {
      console.error('Erreur Firebase Google Sign-In:', err)
      authError.value = err.message || 'Erreur lors de la connexion avec Google'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    if (!import.meta.client) return
    loading.value = true
    try {
      const { $firebaseAuth } = useNuxtApp()
      await signOut($firebaseAuth as Auth)
      user.value = null
    } catch (err: any) {
      console.error('Erreur Firebase Sign-Out:', err)
      authError.value = err.message || 'Erreur lors de la déconnexion'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    initAuth()
  })

  return {
    user,
    loading,
    authError,
    loginWithGoogle,
    logout,
    initAuth
  }
}
