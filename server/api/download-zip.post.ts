import fs from 'node:fs'
import path from 'node:path'
import { PassThrough } from 'node:stream'

export default defineEventHandler(async (event) => {
  const archiverModule: any = await import('archiver')
  const createArchiver = archiverModule.default || archiverModule
  const body = await readBody(event)
  const images: string[] = body?.images || []
  const tags: string = body?.tags || 'flux-anime-archive'

  if (!images || images.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Aucune image sélectionnée pour le téléchargement ZIP.'
    })
  }

  const filename = `archive-${tags}-${Date.now()}.zip`

  // Configuration des headers HTTP pour streaming du fichier binaire ZIP
  setHeader(event, 'Content-Type', 'application/zip')
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
  setHeader(event, 'Cache-Control', 'no-cache')

  const archive = createArchiver('zip', {
    zlib: { level: 9 } // Niveau de compression maximal
  })

  const stream = new PassThrough()

  archive.on('error', (err) => {
    console.error('Erreur streaming ZIP archiver:', err)
    throw err
  })

  archive.pipe(stream)

  // Ajout des images sélectionnées dans le flux ZIP
  const publicDir = path.resolve(process.cwd(), 'public')

  for (let i = 0; i < images.length; i++) {
    const imgItem = images[i]
    const entryName = `image_${i + 1}_${Date.now()}.jpg`

    if (imgItem.startsWith('/generated/') || imgItem.startsWith('generated/')) {
      const cleanPath = imgItem.startsWith('/') ? imgItem.slice(1) : imgItem
      const localFilePath = path.join(publicDir, cleanPath)
      if (fs.existsSync(localFilePath)) {
        archive.file(localFilePath, { name: entryName })
        continue
      }
    }

    if (imgItem.startsWith('data:image/')) {
      const base64Data = imgItem.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      archive.append(buffer, { name: entryName })
      continue
    }

    // URL externe HTTP
    try {
      const response = await fetch(imgItem)
      if (response.ok) {
        const arrayBuf = await response.arrayBuffer()
        archive.append(Buffer.from(arrayBuf), { name: entryName })
      }
    } catch (e) {
      console.warn(`Impossible de fetch l'image ${imgItem}:`, e)
    }
  }

  // Finalisation du flux d'archive
  archive.finalize()

  return sendStream(event, stream)
})
