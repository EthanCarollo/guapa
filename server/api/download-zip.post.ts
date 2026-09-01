import fs from 'node:fs'
import path from 'node:path'
import { PassThrough, Readable } from 'node:stream'
import { saveZipMetadataToFirebase } from '../utils/firebaseAdmin'

export default defineEventHandler(async (event) => {
  const archiverModule: any = await import('archiver')
  const body = await readBody(event)
  const images: string[] = body?.images || []
  const tags: string = body?.tags || 'flux-anime-archive'
  const prenom: string = body?.prenom || 'ethan'

  if (!images || images.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Aucune image sélectionnée pour le téléchargement ZIP.'
    })
  }

  const now = new Date()
  const filename = `archive-${tags}-${now.getTime()}.zip`

  setHeader(event, 'Content-Type', 'application/zip')
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
  setHeader(event, 'Cache-Control', 'no-cache')

  const archive = archiverModule.ZipArchive
    ? new archiverModule.ZipArchive({ zlib: { level: 9 } })
    : (typeof archiverModule.default === 'function' ? archiverModule.default : archiverModule)('zip', {
        zlib: { level: 9 }
      })

  const stream = new PassThrough()

  const archivesDir = path.resolve(process.cwd(), 'public/archives')
  if (!fs.existsSync(archivesDir)) {
    fs.mkdirSync(archivesDir, { recursive: true })
  }
  const localZipPath = path.join(archivesDir, filename)
  const fileWriteStream = fs.createWriteStream(localZipPath)

  archive.on('error', (err: any) => {
    console.error('Erreur streaming ZIP archiver:', err)
    throw err
  })

  // Stream simultané vers la réponse HTTP et le fichier disque
  archive.pipe(stream)
  archive.pipe(fileWriteStream)

  fileWriteStream.on('finish', async () => {
    try {
      const stats = fs.statSync(localZipPath)
      await saveZipMetadataToFirebase({
        prenom,
        date: now,
        filename,
        images,
        tags,
        sizeBytes: stats.size
      })
      console.log(`✅ [Firebase RTDB] Archive ${filename} enregistrée sous /${prenom}/ avec succès (${stats.size} octets)`)
    } catch (firebaseErr) {
      console.error('⚠️ [Firebase RTDB] Erreur lors de l\'enregistrement des métadonnées:', firebaseErr)
    }
  })

  const publicDir = path.resolve(process.cwd(), 'public')

  for (let i = 0; i < images.length; i++) {
    const imgItem = images[i]
    const entryName = `image_${i + 1}_${Date.now()}.jpg`

    // 1. Fichier local sur disque : streamé directement via createReadStream
    if (imgItem.startsWith('/generated/') || imgItem.startsWith('generated/')) {
      const cleanPath = imgItem.startsWith('/') ? imgItem.slice(1) : imgItem
      const localFilePath = path.join(publicDir, cleanPath)
      if (fs.existsSync(localFilePath)) {
        const fileStream = fs.createReadStream(localFilePath)
        archive.append(fileStream, { name: entryName })
        continue
      }
    }

    // 2. Donnée Base64 : streamée sous forme de flux Readable
    if (imgItem.startsWith('data:image/')) {
      const base64Data = imgItem.replace(/^data:image\/\w+;base64,/, '')
      const streamSource = Readable.from(Buffer.from(base64Data, 'base64'))
      archive.append(streamSource, { name: entryName })
      continue
    }

    // 3. URL externe HTTP : streamée directement via Readable.fromWeb sans bufferisation en RAM
    try {
      const response = await fetch(imgItem)
      if (response.ok && response.body) {
        const networkStream = Readable.fromWeb(response.body as any)
        archive.append(networkStream, { name: entryName })
      }
    } catch (e) {
      console.warn(`Impossible de fetch l'image ${imgItem}:`, e)
    }
  }

  // Finalisation du flux d'archive
  archive.finalize()

  return sendStream(event, stream)
})
