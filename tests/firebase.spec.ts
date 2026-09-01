import { describe, it, expect } from 'vitest'
import { sanitizeFirebaseKey, formatZipHour, formatFirebaseZipPath } from '../utils/firebase'

describe('Firebase Utility Functions', () => {
  describe('sanitizeFirebaseKey', () => {
    it('should replace invalid Firebase RTDB characters (. # $ / [ ]) with underscores', () => {
      expect(sanitizeFirebaseKey('archive.file.zip')).toBe('archive_file_zip')
      expect(sanitizeFirebaseKey('user#1$data/test[0]')).toBe('user_1_data_test_0_')
    })

    it('should return fallback string if key is empty or null', () => {
      expect(sanitizeFirebaseKey('')).toBe('unknown')
      expect(sanitizeFirebaseKey(null as any)).toBe('unknown')
    })
  })

  describe('formatZipHour', () => {
    it('should format date into a safe YYYY-MM-DD_HH-mm-ss string', () => {
      const fixedDate = new Date(2026, 8, 1, 14, 5, 30) // 1er septembre 2026 14:05:30
      const formatted = formatZipHour(fixedDate)
      expect(formatted).toBe('2026-09-01_14-05-30')
    })

    it('should pad single-digit months, days, hours, minutes, seconds with zero', () => {
      const singleDigitDate = new Date(2026, 0, 5, 8, 9, 3) // 5 janvier 2026 08:09:03
      const formatted = formatZipHour(singleDigitDate)
      expect(formatted).toBe('2026-01-05_08-09-03')
    })
  })

  describe('formatFirebaseZipPath', () => {
    it('should build path matching /votreprenom/heureduzippage/filename pattern', () => {
      const fixedDate = new Date(2026, 8, 1, 14, 0, 0)
      const path = formatFirebaseZipPath('Ethan', fixedDate, 'archive-anime.zip')
      expect(path).toBe('/ethan/2026-09-01_14-00-00/archive-anime_zip')
    })

    it('should fallback to default prenom ethan if empty', () => {
      const fixedDate = new Date(2026, 8, 1, 12, 30, 0)
      const path = formatFirebaseZipPath('', fixedDate, 'test.zip')
      expect(path).toBe('/ethan/2026-09-01_12-30-00/test_zip')
    })
  })
})
