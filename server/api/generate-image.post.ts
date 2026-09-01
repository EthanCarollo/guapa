import fs from 'node:fs'
import path from 'node:path'

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

  let finalBase64 = ''
  let engine = 'NVIDIA RTX GPU (Local CUDA Ingestion)'

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
        finalBase64 = gpuData.imageUrl.replace(/^data:image\/\w+;base64,/, '')
        engine = gpuData.device || 'NVIDIA RTX 5060 (Local CUDA)'
      }
    }
  } catch (gpuErr) {
    console.warn('Microservice GPU local injoignable, bascule automatique sur moteur de secours.')
  }

  // 2. Moteur de secours si le microservice GPU local n'est pas actif
  if (!finalBase64) {
    try {
      const encodedPrompt = encodeURIComponent(`${prompt}, koni anime style, vibrant colors, detailed anime masterpiece`)
      const fluxEndpoint = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=768&height=768&model=flux&nologo=true`

      const imgResponse = await fetch(fluxEndpoint)
      if (!imgResponse.ok) {
        throw new Error(`Erreur du moteur FLUX (${imgResponse.status})`)
      }

      const arrayBuffer = await imgResponse.arrayBuffer()
      finalBase64 = Buffer.from(arrayBuffer).toString('base64')
      engine = 'FLUX Accelerated Pipeline (Fallback)'
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
        prompt,
        seed
      }
    }
  }

  // 3. Sauvegarde physique du fichier sur le disque dans /public/generated/
  const filename = `flux-${Date.now()}-${seed}.jpg`
  const filePath = path.join(generatedDir, filename)
  const imageBuffer = Buffer.from(finalBase64, 'base64')
  fs.writeFileSync(filePath, imageBuffer)

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
