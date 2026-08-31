export function calculateDevopsScore(testsPassed: number, totalTests: number, coverage: number): { score: number; status: 'EXCELLENT' | 'GOOD' | 'POOR' } {
  if (totalTests === 0) return { score: 0, status: 'POOR' }
  const testRatio = Math.min(Math.max(testsPassed / totalTests, 0), 1)
  const normCoverage = Math.min(Math.max(coverage / 100, 0), 1)
  
  const score = Math.round((testRatio * 60 + normCoverage * 40))
  let status: 'EXCELLENT' | 'GOOD' | 'POOR' = 'POOR'
  
  if (score >= 80) {
    status = 'EXCELLENT'
  } else if (score >= 50) {
    status = 'GOOD'
  }
  
  return { score, status }
}

export function formatGitTag(version: string, env: 'staging' | 'production'): string {
  if (!version || version.trim() === '') {
    return env === 'production' ? 'v1.0.0-production' : 'v1.0.0-staging'
  }
  const cleanVersion = version.startsWith('v') ? version : `v${version}`
  return `${cleanVersion}-${env}`
}
