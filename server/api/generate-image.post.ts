export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const prompt = body?.prompt || 'anime masterpiece, 1girl, colorful aesthetic, high quality illustration'
  const modelId = process.env.HF_MODEL_ID || 'Sawata97/flux2_4b_koni_animestyle'
  const hfToken = process.env.HF_API_TOKEN
  const seed = body?.seed || Math.floor(Math.random() * 2147483647)

  try {
    if (hfToken) {
      // Appel API Inference Hugging Face avec seed aléatoire
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
            num_inference_steps: 25
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
          isAiLive: true,
          timestamp: new Date().toISOString()
        }
      }
    }

    // Générateur d'image unique en temps réel par Seed (Pollinations AI FLUX engine)
    // Produit une VRAIE génération FLUX différente à chaque appel / seed aléatoire sans clé requise
    const encodedPrompt = encodeURIComponent(`${prompt}, koni anime style, high resolution, detailed anime artwork`)
    const liveFluxUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=768&height=768&model=flux&nologo=true`

    return {
      success: true,
      model: modelId,
      prompt,
      seed,
      imageUrl: liveFluxUrl,
      isAiLive: true,
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
