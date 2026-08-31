export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const prompt = body?.prompt || 'anime masterpiece, 1girl, colorful aesthetic, high quality illustration'
  const modelId = process.env.HF_MODEL_ID || 'Sawata97/flux2_4b_koni_animestyle'
  const hfToken = process.env.HF_API_TOKEN

  try {
    if (!hfToken) {
      // Fallback avec illustration animée de haute qualité si la clé HF n'est pas renseignée
      const mockImages = [
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=700&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=700&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=700&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1563089145-599997674d42?w=700&auto=format&fit=crop&q=85'
      ]
      const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)]
      return {
        success: true,
        model: modelId,
        prompt,
        imageUrl: randomImg,
        isFallback: true,
        timestamp: new Date().toISOString()
      }
    }

    // Appel direct à l'Inference API Hugging Face
    const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: prompt })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Hugging Face API error (${response.status}): ${errorText}`)
    }

    const imageBuffer = await response.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const mimeType = response.headers.get('content-type') || 'image/jpeg'

    return {
      success: true,
      model: modelId,
      prompt,
      imageUrl: `data:${mimeType};base64,${base64Image}`,
      isFallback: false,
      timestamp: new Date().toISOString()
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
      prompt
    }
  }
})
