export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const images = body?.images || []
  const tags = body?.tags || 'anime-flux'
  const topic = process.env.PUBSUB_TOPIC || 'ecni2-1'

  // Simule l'envoi dans la file Pub/Sub pour le TP Queuing
  return {
    success: true,
    message: `Message envoyé avec succès au topic Pub/Sub "${topic}"`,
    queuedImagesCount: images.length,
    tags,
    jobId: `job-${Date.now()}`,
    queuedAt: new Date().toISOString()
  }
})
