/**
 * Utilitaires pour le formatage et la validation des clés et chemins Firebase Realtime Database
 */

/**
 * Nettoie une chaîne pour qu'elle devienne une clé valide Firebase RTDB
 * (interdit les caractères '.', '#', '$', '/', '[', ']')
 */
export function sanitizeFirebaseKey(key: string): string {
  if (!key) return 'unknown'
  return key.replace(/[.#$/[\]]/g, '_')
}

/**
 * Formate l'heure du zippage pour créer un segment de chemin lisible et valide
 * Ex: "2026-09-01_14-05-30"
 */
export function formatZipHour(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`
}

/**
 * Construit le chemin complet dans Firebase Realtime Database
 * Format attendu par le TP : /votreprenom/heureduzippage/filename
 */
export function formatFirebaseZipPath(prenom: string, date: Date, filename: string): string {
  const cleanPrenom = sanitizeFirebaseKey(prenom.toLowerCase().trim() || 'ethan')
  const cleanHour = formatZipHour(date)
  const cleanFilename = sanitizeFirebaseKey(filename)

  return `/${cleanPrenom}/${cleanHour}/${cleanFilename}`
}
