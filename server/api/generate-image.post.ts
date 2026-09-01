import fs from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const prompt = body?.prompt || 'cyberpunk anime girl with glowing cyan hair, holographic headphones, rain reflection, vibrant colors'
  const modelId = process.env.HF_MODEL_ID || 'Sawata97/flux2_4b_koni_animestyle'
  const seed = body?.seed || Math.floor(Math.random() * 2147483647)
  const gpuServerUrl = process.env.GPU_SERVER_URL || 'http://localhost:5000'

  const generatedDir = path.resolve(process.cwd(), 'public/generated')
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true })
  }

  const filename = `flux-${Date.now()}-${seed}.jpg`
  const filePath = path.join(generatedDir, filename)

  let engine = 'NVIDIA RTX GPU (Local CUDA Ingestion)'
  let imageGenerated = false

  // 1. Appel prioritaire au microservice GPU local (CUDA RTX 5060 Q8)
  try {
    const gpuResponse = await fetch(gpuServerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, seed })
    })

    if (gpuResponse.ok) {
      const gpuData = await gpuResponse.json()
      if (gpuData.success && gpuData.imageUrl) {
        const base64Data = gpuData.imageUrl.replace(/^data:image\/\w+;base64,/, '')
        const base64Stream = Readable.from(Buffer.from(base64Data, 'base64'))
        await pipeline(base64Stream, fs.createWriteStream(filePath))
        engine = gpuData.device || 'NVIDIA RTX 5060 (Local CUDA)'
        imageGenerated = true
      }
    }
  } catch (gpuErr) {
    console.warn('Microservice GPU local injoignable, bascule automatique sur moteur de secours.')
  }

  // 2. Moteur de secours FLUX avec streaming direct vers le disque sans bufferisation RAM
  if (!imageGenerated) {
    try {
      const encodedPrompt = encodeURIComponent(`${prompt}, koni anime style, vibrant colors, detailed anime masterpiece`)
      const fluxEndpoint = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=768&height=768&model=flux&nologo=true`

      const imgResponse = await fetch(fluxEndpoint)
      if (!imgResponse.ok || !imgResponse.body) {
        throw new Error(`Erreur du moteur FLUX (${imgResponse.status})`)
      }

      // Stream direct de la réponse HTTP vers le fichier disque
      const nodeStream = Readable.fromWeb(imgResponse.body as any)
      await pipeline(nodeStream, fs.createWriteStream(filePath))
      engine = 'FLUX Accelerated Pipeline (Fallback)'
      imageGenerated = true
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
        prompt,
        seed
      }
    }
  }

  // URL publique servie par Nuxt
  const publicUrl = `/generated/${filename}`

  // Sauvegarde des métadonnées
  const metadataPath = path.join(generatedDir, 'history.json')
  let history: any[] = []
  if (fs.existsSync(metadataPath)) {
    try {
      history = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
    } catch {
      history = []
    }
  }

  const newItem = {
    id: `gen-${Date.now()}-${seed}`,
    filename,
    url: publicUrl,
    prompt,
    seed,
    engine,
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    date: new Date().toISOString()
  }

  history.unshift(newItem)
  fs.writeFileSync(metadataPath, JSON.stringify(history, null, 2), 'utf-8')

  return {
    success: true,
    ...newItem
  }
})
