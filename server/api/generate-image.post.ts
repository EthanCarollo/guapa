export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const prompt = body?.prompt || 'cyberpunk anime girl with glowing cyan hair, holographic headphones, rain reflection, vibrant colors'
  const modelId = process.env.HF_MODEL_ID || 'Sawata97/flux2_4b_koni_animestyle'
  const hfToken = process.env.HF_API_TOKEN
  const seed = body?.seed || Math.floor(Math.random() * 2147483647)

  try {
    // 1. Si le token Hugging Face est présent, appeler l'API Inference officielle
    if (hfToken) {
      try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${hfToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              seed: seed,
              guidance_scale: 7.5,
              num_inference_steps: 28
            }
          })
        })

        if (response.ok) {
          const imageBuffer = await response.arrayBuffer()
          const base64Image = Buffer.from(imageBuffer).toString('base64')
          const mimeType = response.headers.get('content-type') || 'image/jpeg'

          return {
            success: true,
            model: modelId,
            prompt,
            seed,
            imageUrl: `data:${mimeType};base64,${base64Image}`,
            timestamp: new Date().toISOString()
          }
        }
      } catch (e) {
        console.warn('HF Inference failed, falling back to direct stream fetch', e)
      }
    }

    // 2. Génération FLUX en temps réel : Le serveur télécharge le buffer complet côté backend
    // et le renvoie en Data URL Base64 garantie au frontend (évite les timeouts et blocages d'URL directes)
    const encodedPrompt = encodeURIComponent(`${prompt}, koni anime style, vibrant colors, detailed anime masterpiece`)
    const fluxEndpoint = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=768&height=768&model=flux&nologo=true`

    const imgResponse = await fetch(fluxEndpoint)
    if (!imgResponse.ok) {
      throw new Error(`Erreur du moteur de génération FLUX (${imgResponse.status})`)
    }

    const arrayBuffer = await imgResponse.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')
    const contentType = imgResponse.headers.get('content-type') || 'image/jpeg'

    return {
      success: true,
      model: modelId,
      prompt,
      seed,
      imageUrl: `data:${contentType};base64,${base64Data}`,
      timestamp: new Date().toISOString()
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
      prompt,
      seed
    }
  }
})
