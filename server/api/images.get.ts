import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(() => {
  const generatedDir = path.resolve(process.cwd(), 'public/generated')
  const metadataPath = path.join(generatedDir, 'history.json')

  if (!fs.existsSync(metadataPath)) {
    return { images: [] }
  }

  try {
    const data = fs.readFileSync(metadataPath, 'utf-8')
    const history = JSON.parse(data)
    return { images: history }
  } catch (err: any) {
    return { images: [], error: err.message }
  }
})
