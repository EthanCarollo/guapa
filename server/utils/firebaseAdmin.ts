import fs from 'node:fs'
import path from 'node:path'
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getDatabase, type Database } from 'firebase-admin/database'
import { formatZipHour, sanitizeFirebaseKey } from '../../utils/firebase'

const FIREBASE_DATABASE_URL = 'https://ecni2-2026-default-rtdb.firebaseio.com'
const DEFAULT_PRENOM = process.env.FIREBASE_USER_PRENOM || 'ethan'
const DEFAULT_GCS_BUCKET = process.env.STORAGE_BUCKET || 'ecni22026bucket'

let adminApp: App | null = null
let realtimeDb: Database | null = null

/**
 * Initialise ou récupère l'instance unique Firebase Admin SDK
 */
export function getFirebaseAdminApp(): App {
  if (adminApp) return adminApp

  const existingApps = getApps()
  if (existingApps.length > 0) {
    adminApp = existingApps[0]
    return adminApp
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.resolve(process.cwd(), 'id.json')
  
  if (!fs.existsSync(credentialsPath)) {
    throw new Error(`Fichier de credentials Google/Firebase introuvable : ${credentialsPath}`)
  }

  const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'))

  adminApp = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: FIREBASE_DATABASE_URL
  }, 'guapa-admin')

  return adminApp
}

/**
 * Récupère la référence Realtime Database
 */
export function getFirebaseRealtimeDb(): Database {
  if (!realtimeDb) {
    const app = getFirebaseAdminApp()
    realtimeDb = getDatabase(app)
  }
  return realtimeDb
}

export interface ZipRecordPayload {
  filename: string
  images: string[]
  tags: string
  imagesCount: number
  sizeBytes?: number
  gcsPath?: string
  downloadUrl?: string
  cloudUrl?: string
  createdAt: string
  timestamp: number
  prenom: string
  firebasePath: string
}

/**
 * Sauvegarde les métadonnées et chemins du ZIP dans Firebase Realtime Database
 * Chemin spécifié par le TP : /votreprenom/heureduzippage/filename
 */
export async function saveZipMetadataToFirebase(options: {
  prenom?: string
  date?: Date
  filename: string
  images: string[]
  tags: string
  sizeBytes?: number
}): Promise<ZipRecordPayload> {
  const db = getFirebaseRealtimeDb()
  const date = options.date || new Date()
  const prenom = sanitizeFirebaseKey((options.prenom || DEFAULT_PRENOM).toLowerCase().trim())
  const hourSegment = formatZipHour(date)
  const filenameClean = sanitizeFirebaseKey(options.filename)

  const firebasePath = `/${prenom}/${hourSegment}/${filenameClean}`
  const gcsPath = `gs://${DEFAULT_GCS_BUCKET}/zips/${options.filename}`
  const downloadUrl = `/archives/${options.filename}`
  const cloudUrl = `https://storage.googleapis.com/${DEFAULT_GCS_BUCKET}/zips/${options.filename}`

  const payload: ZipRecordPayload = {
    filename: options.filename,
    images: options.images,
    tags: options.tags,
    imagesCount: options.images.length,
    sizeBytes: options.sizeBytes || 0,
    gcsPath,
    downloadUrl,
    cloudUrl,
    createdAt: date.toISOString(),
    timestamp: date.getTime(),
    prenom,
    firebasePath
  }

  const ref = db.ref(firebasePath)
  await ref.set(payload)

  return payload
}

/**
 * Récupère la liste de tous les ZIPs enregistrés dans Firebase pour un prénom donné
 */
export async function getAllZipsFromFirebase(prenom: string = DEFAULT_PRENOM): Promise<ZipRecordPayload[]> {
  const db = getFirebaseRealtimeDb()
  const cleanPrenom = sanitizeFirebaseKey(prenom.toLowerCase().trim())
  const userRef = db.ref(`/${cleanPrenom}`)
  
  const snapshot = await userRef.once('value')
  const data = snapshot.val()

  if (!data) return []

  const list: ZipRecordPayload[] = []

  // Parcourt la hiérarchie : /prenom/heureduzippage/filename
  for (const hourKey of Object.keys(data)) {
    const hourData = data[hourKey]
    if (typeof hourData === 'object' && hourData !== null) {
      for (const fileKey of Object.keys(hourData)) {
        const fileRecord = hourData[fileKey]
        if (fileRecord && typeof fileRecord === 'object') {
          list.push({
            filename: fileRecord.filename || `${fileKey}.zip`,
            images: Array.isArray(fileRecord.images) ? fileRecord.images : [],
            tags: fileRecord.tags || 'archive',
            imagesCount: fileRecord.imagesCount || (Array.isArray(fileRecord.images) ? fileRecord.images.length : 0),
            sizeBytes: fileRecord.sizeBytes || 0,
            gcsPath: fileRecord.gcsPath || `gs://${DEFAULT_GCS_BUCKET}/zips/${fileRecord.filename || fileKey}`,
            downloadUrl: fileRecord.downloadUrl || `/archives/${fileRecord.filename || fileKey}`,
            cloudUrl: fileRecord.cloudUrl || `https://storage.googleapis.com/${DEFAULT_GCS_BUCKET}/zips/${fileRecord.filename || fileKey}`,
            createdAt: fileRecord.createdAt || new Date(fileRecord.timestamp || Date.now()).toISOString(),
            timestamp: fileRecord.timestamp || Date.now(),
            prenom: fileRecord.prenom || cleanPrenom,
            firebasePath: fileRecord.firebasePath || `/${cleanPrenom}/${hourKey}/${fileKey}`
          })
        }
      }
    }
  }

  // Trier par date décroissante (le plus récent en premier)
  list.sort((a, b) => b.timestamp - a.timestamp)

  return list
}
