import { getAllZipsFromFirebase } from '../utils/firebaseAdmin'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const prenom = (query.prenom as string) || process.env.FIREBASE_USER_PRENOM || 'ethan'

  try {
    const zips = await getAllZipsFromFirebase(prenom)
    return {
      success: true,
      prenom,
      count: zips.length,
      zips
    }
  } catch (error: any) {
    console.error('Erreur lors de la récupération des ZIPs depuis Firebase:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Erreur Firebase Realtime Database : ${error.message}`
    })
  }
})
