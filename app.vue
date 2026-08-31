<template>
  <div class="app-container">
    <header class="header">
      <div class="badge">🚀 TP DevOps CI/CD</div>
      <h1>Guapa Continuous Delivery Platform</h1>
      <p class="subtitle">Pipeline automatisé avec GitHub Actions, Docker (GHCR), Tests Vitest & Git Flow</p>
    </header>

    <main class="dashboard">
      <div class="card status-card">
        <h2>Pipeline Status</h2>
        <div class="status-grid">
          <div class="status-item">
            <span class="dot active"></span>
            <div>
              <strong>Environnement Actuel</strong>
              <p>{{ currentEnv }}</p>
            </div>
          </div>
          <div class="status-item">
            <span class="dot active"></span>
            <div>
              <strong>Tests Unitaires</strong>
              <p>Vitest + V8 Coverage (100% Pass)</p>
            </div>
          </div>
          <div class="status-item">
            <span class="dot active"></span>
            <div>
              <strong>Conteneurisation</strong>
              <p>ghcr.io/ethancarollo/guapa</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card calculator-card">
        <h2>Simulateur Métriques DevOps</h2>
        <div class="inputs">
          <div class="input-group">
            <label>Tests réussis</label>
            <input v-model.number="testsPassed" type="number" min="0" :max="totalTests" />
          </div>
          <div class="input-group">
            <label>Total tests</label>
            <input v-model.number="totalTests" type="number" min="1" />
          </div>
          <div class="input-group">
            <label>Couverture (%)</label>
            <input v-model.number="coverage" type="number" min="0" max="100" />
          </div>
        </div>

        <div class="score-display">
          <div class="score-number">{{ result.score }} / 100</div>
          <span :class="['status-tag', result.status.toLowerCase()]">{{ result.status }}</span>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { calculateDevopsScore } from './utils/devops'

const currentEnv = ref(process.env.NODE_ENV === 'production' ? 'Production' : 'Staging / Local')
const testsPassed = ref(7)
const totalTests = ref(7)
const coverage = ref(100)

const result = computed(() => {
  return calculateDevopsScore(testsPassed.value, totalTests.value, coverage.value)
})
</script>

<style>
:root {
  --bg: #0b0f19;
  --card-bg: rgba(22, 30, 49, 0.75);
  --border: rgba(255, 255, 255, 0.1);
  --primary: #38bdf8;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --text: #f8fafc;
  --text-muted: #94a3b8;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

body {
  background-color: var(--bg);
  color: var(--text);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.app-container {
  width: 100%;
  max-width: 900px;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.badge {
  display: inline-block;
  background: rgba(56, 189, 248, 0.15);
  color: var(--primary);
  padding: 0.4rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.header h1 {
  font-size: 2.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-muted);
  font-size: 1.1rem;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.card {
  background: var(--card-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 1.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.card h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: #e2e8f0;
}

.status-grid {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--text-muted);
}

.dot.active {
  background: var(--success);
  box-shadow: 0 0 10px var(--success);
}

.status-item p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.inputs {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
}

.input-group input {
  width: 100%;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.5rem;
  color: var(--text);
  font-size: 1rem;
}

.score-display {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.25rem;
  text-align: center;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.score-number {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--primary);
}

.status-tag {
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
}

.status-tag.excellent {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success);
}

.status-tag.good {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning);
}

.status-tag.poor {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger);
}
</style>
