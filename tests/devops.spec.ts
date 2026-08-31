import { describe, it, expect } from 'vitest'
import { calculateDevopsScore, formatGitTag } from '../utils/devops'

describe('DevOps Utility Functions', () => {
  describe('calculateDevopsScore', () => {
    it('should return score 0 and POOR if total tests is 0', () => {
      const result = calculateDevopsScore(0, 0, 80)
      expect(result.score).toBe(0)
      expect(result.status).toBe('POOR')
    })

    it('should calculate score correctly for high metrics (EXCELLENT)', () => {
      const result = calculateDevopsScore(10, 10, 90)
      expect(result.score).toBe(96)
      expect(result.status).toBe('EXCELLENT')
    })

    it('should calculate score correctly for average metrics (GOOD)', () => {
      const result = calculateDevopsScore(8, 10, 50)
      expect(result.score).toBe(68)
      expect(result.status).toBe('GOOD')
    })

    it('should calculate score correctly for low metrics (POOR)', () => {
      const result = calculateDevopsScore(3, 10, 20)
      expect(result.score).toBe(26)
      expect(result.status).toBe('POOR')
    })
  })

  describe('formatGitTag', () => {
    it('should handle version without leading v', () => {
      expect(formatGitTag('1.2.0', 'staging')).toBe('v1.2.0-staging')
      expect(formatGitTag('1.2.0', 'production')).toBe('v1.2.0-production')
    })

    it('should handle version with leading v', () => {
      expect(formatGitTag('v2.0.0', 'staging')).toBe('v2.0.0-staging')
    })

    it('should fallback if empty', () => {
      expect(formatGitTag('', 'staging')).toBe('v1.0.0-staging')
      expect(formatGitTag('', 'production')).toBe('v1.0.0-production')
    })
  })
})
