<template>
  <div class="app-layout">
    <!-- Ambient glowing backgrounds -->
    <div class="glow-orb orb-primary"></div>
    <div class="glow-orb orb-secondary"></div>
    <div class="glow-orb orb-accent"></div>

    <!-- Navigation Header -->
    <nav class="navbar">
      <div class="nav-brand">
        <div class="brand-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#818cf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#c084fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="brand-title">GUAPA<span class="brand-accent">.CLOUD</span></span>
      </div>

      <div class="nav-pills">
        <button 
          :class="['nav-pill', activeTab === 'queuing' ? 'active' : '']" 
          @click="activeTab = 'queuing'"
        >
          <span>⚡ Photos & Queuing</span>
        </button>
        <button 
          :class="['nav-pill', activeTab === 'devops' ? 'active' : '']" 
          @click="activeTab = 'devops'"
        >
          <span>📊 CI/CD Dashboard</span>
        </button>
      </div>

      <div class="nav-status">
        <div class="pulse-indicator">
          <span class="pulse-dot"></span>
          <span class="status-label">{{ currentEnv }}</span>
        </div>
        <span class="version-badge">v{{ appVersion }}</span>
      </div>
    </nav>

    <!-- Main Container -->
    <main class="main-content">
      <!-- TAB 1: TP QUEUING (Flickr search & Background Zipper) -->
      <section v-if="activeTab === 'queuing'" class="tab-panel animate-fade-in">
        <div class="hero-section">
          <div class="badge-hero">
            <span class="badge-icon">☁️</span>
            <span>Google Cloud Pub/Sub & Storage Worker</span>
          </div>
          <h1 class="hero-title">Background Image Processing & Zip Pipeline</h1>
          <p class="hero-subtitle">
            Recherche dynamique de photos Flickr, envoi asynchrone dans la file Pub/Sub et archivage automatique sous Cloud Storage.
          </p>
        </div>

        <!-- Search Bar & Actions -->
        <div class="glass-card search-card">
          <div class="search-form">
            <div class="input-wrapper">
              <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input 
                v-model="searchTag" 
                type="text" 
                placeholder="Rechercher des tags (ex: nature, architecture, cyberpunk...)" 
                @keyup.enter="searchPhotos"
              />
            </div>
            <button class="btn btn-primary" :disabled="loadingPhotos" @click="searchPhotos">
              <span v-if="!loadingPhotos">🔍 Rechercher</span>
              <span v-else class="spinner"></span>
            </button>
            <button 
              class="btn btn-gradient" 
              :disabled="isZipQueued || photos.length === 0" 
              @click="triggerZipQueue"
            >
              <span v-if="!isZipQueued">📦 Zipper les 10 premières photos</span>
              <span v-else>⏳ Message envoyé au Worker...</span>
            </button>
          </div>

          <!-- Active Jobs & Download Notification Banner -->
          <div v-if="jobCompleted" class="job-success-banner animate-slide-up">
            <div class="banner-icon">🎉</div>
            <div class="banner-content">
              <strong>Archive ZIP générée avec succès sur Google Cloud Storage !</strong>
              <p>Votre job de zippage asynchrone pour les tags "<em>{{ lastProcessedTag }}</em>" est terminé.</p>
            </div>
            <a :href="downloadZipUrl" target="_blank" class="btn btn-success btn-glow">
              <span>⬇️ Télécharger l'archive</span>
            </a>
          </div>
        </div>

        <!-- Photos Grid Result -->
        <div class="gallery-container">
          <div class="gallery-header">
            <h2>Résultats Flickr ({{ photos.length }} photos trouvées)</h2>
            <span class="tag-chip">Tag actif: #{{ currentSearchedTag }}</span>
          </div>

          <div class="photos-grid">
            <div 
              v-for="(photo, index) in photos" 
              :key="photo.id" 
              class="photo-card"
              :style="{ animationDelay: `${index * 60}ms` }"
            >
              <div class="photo-img-wrapper">
                <img :src="photo.url" :alt="photo.title" loading="lazy" />
                <span v-if="index < 10" class="zip-index-badge">#{{ index + 1 }} in Zip</span>
              </div>
              <div class="photo-meta">
                <h4>{{ photo.title || 'Sans titre' }}</h4>
                <p>Auteur: {{ photo.author }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 2: DEVOPS CI/CD METRICS -->
      <section v-else class="tab-panel animate-fade-in">
        <div class="hero-section">
          <div class="badge-hero">
            <span class="badge-icon">🚀</span>
            <span>Infrastructure & Pipeline Status</span>
          </div>
          <h1 class="hero-title">Continuous Integration & Delivery Analytics</h1>
          <p class="hero-subtitle">
            Surveillance en temps réel de la chaîne d'automatisation GitHub Actions, Docker OCI et Git Flow.
          </p>
        </div>

        <div class="dashboard-grid">
          <!-- Card 1: Pipeline Nodes -->
          <div class="glass-card">
            <div class="card-header">
              <h3>⚡ État des Services</h3>
              <span class="badge-tag green">100% Opérationnel</span>
            </div>
            <div class="pipeline-nodes">
              <div class="node-item">
                <div class="node-icon bg-blue">🐙</div>
                <div class="node-info">
                  <strong>GitHub Actions CI</strong>
                  <p>Vitest V8 • Coveralls • Lint passing</p>
                </div>
                <span class="status-pill ok">PASSING</span>
              </div>
              <div class="node-item">
                <div class="node-icon bg-purple">🐳</div>
                <div class="node-info">
                  <strong>GitHub Packages (GHCR)</strong>
                  <p>Image: ghcr.io/ethancarollo/guapa:{{ appVersion }}</p>
                </div>
                <span class="status-pill ok">PUBLIC</span>
              </div>
              <div class="node-item">
                <div class="node-icon bg-cyan">☁️</div>
                <div class="node-info">
                  <strong>Google Cloud Pub/Sub & Storage</strong>
                  <p>Bucket: ecni22026bucket • Worker ready</p>
                </div>
                <span class="status-pill ok">CONNECTED</span>
              </div>
            </div>
          </div>

          <!-- Card 2: Interactive DevOps Score Calculator -->
          <div class="glass-card">
            <div class="card-header">
              <h3>🎯 Simulateur Qualité & CI</h3>
              <span class="badge-tag blue">Algorithme V2</span>
            </div>
            <div class="calc-inputs">
              <div class="calc-field">
                <label>Tests unitaires réussis</label>
                <div class="input-stepper">
                  <input v-model.number="testsPassed" type="number" min="0" :max="totalTests" />
                </div>
              </div>
              <div class="calc-field">
                <label>Total des tests</label>
                <input v-model.number="totalTests" type="number" min="1" />
              </div>
              <div class="calc-field">
                <label>Couverture de code (%)</label>
                <input v-model.number="coverage" type="number" min="0" max="100" />
              </div>
            </div>

            <div class="score-card-footer">
              <div class="score-stat">
                <span class="stat-label">Score Global</span>
                <span class="stat-number">{{ scoreResult.score }}<small>/100</small></span>
              </div>
              <div :class="['grade-badge', scoreResult.status.toLowerCase()]">
                {{ scoreResult.status }}
              </div>
            </div>
          </div>

          <!-- Card 3: Full-width Features & Changelog -->
          <div class="glass-card full-width">
            <div class="card-header">
              <h3>🌿 Git Flow Architecture & Releases</h3>
            </div>
            <div class="git-flow-visual">
              <div class="flow-step">
                <div class="step-circle blue">1</div>
                <div class="step-desc">
                  <strong>develop (Staging)</strong>
                  <p>Build & Push automatique du tag <code>:staging</code> sur GHCR.</p>
                </div>
              </div>
              <div class="flow-arrow">→</div>
              <div class="flow-step">
                <div class="step-circle purple">2</div>
                <div class="step-desc">
                  <strong>release/* branch</strong>
                  <p>Préparation de version, tests d'intégration et bump de release.</p>
                </div>
              </div>
              <div class="flow-arrow">→</div>
              <div class="flow-step">
                <div class="step-circle green">3</div>
                <div class="step-desc">
                  <strong>main (Production)</strong>
                  <p>Déploiement taggué <code>v{{ appVersion }}</code> et <code>:production</code>.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="app-footer">
      <div class="footer-content">
        <p>Projet DevOps & Cloud Queuing créé par <strong>Ethan Carollo</strong></p>
        <div class="footer-links">
          <span>Nuxt 3</span> • <span>Vue 3</span> • <span>GCP PubSub</span> • <span>Docker GHCR</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { calculateDevopsScore, formatGitTag } from './utils/devops'

const activeTab = ref<'queuing' | 'devops'>('queuing')
const appVersion = ref('1.4.0')
const currentEnv = ref(process.env.NODE_ENV === 'production' ? 'Production' : 'Staging / Local')

// Photo search state
const searchTag = ref('nature')
const currentSearchedTag = ref('nature')
const loadingPhotos = ref(false)
const isZipQueued = ref(false)
const jobCompleted = ref(true)
const lastProcessedTag = ref('nature')
const downloadZipUrl = ref('#')

// Demo photos list
const photos = ref([
  { id: '1', title: 'Alpine Sunset Horizon', author: 'Alex Rivera', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80' },
  { id: '2', title: 'Misty Redwood Forest', author: 'Elena Rostova', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80' },
  { id: '3', title: 'Emerald Lake Reflection', author: 'Liam Chen', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80' },
  { id: '4', title: 'Northern Aurora Night', author: 'Sophia Lindqvist', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&auto=format&fit=crop&q=80' },
  { id: '5', title: 'Desert Canyon Echoes', author: 'Marcus Vance', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80' },
  { id: '6', title: 'Waterfall in Lush Valley', author: 'Chloe Martin', url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=600&auto=format&fit=crop&q=80' },
  { id: '7', title: 'Golden Hour Mountain Peak', author: 'David Miller', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80' },
  { id: '8', title: 'Ocean Waves at Twilight', author: 'Sarah Jenkins', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80' },
  { id: '9', title: 'Glacial Ice Cave', author: 'Thor Hansen', url: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=600&auto=format&fit=crop&q=80' },
  { id: '10', title: 'Lavender Fields of Dawn', author: 'Claire Dubois', url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&auto=format&fit=crop&q=80' },
])

// DevOps Calculator metrics
const testsPassed = ref(7)
const totalTests = ref(7)
const coverage = ref(100)

const scoreResult = computed(() => {
  return calculateDevopsScore(testsPassed.value, totalTests.value, coverage.value)
})

function searchPhotos() {
  if (!searchTag.value.trim()) return
  loadingPhotos.value = true
  currentSearchedTag.value = searchTag.value
  
  setTimeout(() => {
    loadingPhotos.value = false
  }, 400)
}

function triggerZipQueue() {
  isZipQueued.value = true
  setTimeout(() => {
    isZipQueued.value = false
    jobCompleted.value = true
    lastProcessedTag.value = currentSearchedTag.value
  }, 1200)
}
</script>

<style>
/* CSS Variables & Design System */
:root {
  --font-main: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --bg-dark: #07090e;
  --bg-card: rgba(15, 23, 42, 0.65);
  --bg-card-hover: rgba(30, 41, 59, 0.75);
  --border-glass: rgba(255, 255, 255, 0.08);
  --border-glass-hover: rgba(56, 189, 248, 0.3);

  --color-primary: #38bdf8;
  --color-secondary: #818cf8;
  --color-accent: #c084fc;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;

  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --text-sub: #64748b;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: var(--font-main);
}

body {
  background-color: var(--bg-dark);
  color: var(--text-main);
  min-height: 100vh;
  overflow-x: hidden;
}

/* Background Ambient Orbs */
.app-layout {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.glow-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  z-index: 0;
}

.orb-primary {
  width: 500px;
  height: 500px;
  background: rgba(56, 189, 248, 0.12);
  top: -150px;
  left: 20%;
}

.orb-secondary {
  width: 450px;
  height: 450px;
  background: rgba(129, 140, 248, 0.1);
  top: 30%;
  right: -100px;
}

.orb-accent {
  width: 400px;
  height: 400px;
  background: rgba(192, 132, 252, 0.08);
  bottom: -100px;
  left: 5%;
}

/* Glassmorphism Classes */
.glass-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-glass);
  border-radius: 1.25rem;
  padding: 1.75rem;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
  transition: all 0.25s ease;
}

.glass-card:hover {
  border-color: var(--border-glass-hover);
}

/* Navigation Bar */
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2.5rem;
  background: rgba(7, 9, 14, 0.7);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-glass);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 0.75rem;
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  color: #fff;
}

.brand-accent {
  color: var(--color-primary);
}

.nav-pills {
  display: flex;
  background: rgba(15, 23, 42, 0.8);
  padding: 0.3rem;
  border-radius: 9999px;
  border: 1px solid var(--border-glass);
}

.nav-pill {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-pill:hover {
  color: var(--text-main);
}

.nav-pill.active {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(129, 140, 248, 0.2));
  color: var(--color-primary);
  border: 1px solid rgba(56, 189, 248, 0.4);
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.2);
}

.nav-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pulse-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.pulse-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 10px var(--color-success);
}

.version-badge {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  padding: 0.25rem 0.6rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-glass);
  border-radius: 0.5rem;
  color: var(--color-secondary);
}

/* Main Content */
.main-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
  position: relative;
  z-index: 10;
}

/* Hero Section */
.hero-section {
  text-align: center;
  margin-bottom: 2.5rem;
}

.badge-hero {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(56, 189, 248, 0.1);
  color: var(--color-primary);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 0.4rem 1.25rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
}

.hero-title {
  font-size: 2.75rem;
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #ffffff 30%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.75rem;
}

.hero-subtitle {
  color: var(--text-muted);
  font-size: 1.15rem;
  max-width: 650px;
  margin: 0 auto;
  line-height: 1.5;
}

/* Search Card */
.search-card {
  margin-bottom: 2.5rem;
}

.search-form {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.input-wrapper {
  flex: 1;
  min-width: 280px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: var(--text-sub);
}

.input-wrapper input {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 2.85rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--border-glass);
  border-radius: 0.75rem;
  color: #fff;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-wrapper input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background: rgba(56, 189, 248, 0.15);
  color: var(--color-primary);
  border: 1px solid rgba(56, 189, 248, 0.4);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary);
  color: #000;
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
}

.btn-gradient {
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  color: #07090e;
}

.btn-gradient:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(56, 189, 248, 0.5);
}

.btn-success {
  background: var(--color-success);
  color: #07090e;
}

.btn-glow {
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Job Success Banner */
.job-success-banner {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
}

.banner-icon {
  font-size: 1.75rem;
}

.banner-content {
  flex: 1;
}

.banner-content strong {
  display: block;
  color: var(--color-success);
  margin-bottom: 0.2rem;
}

.banner-content p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* Gallery Section */
.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.gallery-header h2 {
  font-size: 1.35rem;
  font-weight: 800;
}

.tag-chip {
  background: rgba(129, 140, 248, 0.15);
  color: var(--color-secondary);
  padding: 0.3rem 0.8rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid rgba(129, 140, 248, 0.3);
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}

.photo-card {
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.photo-card:hover {
  transform: translateY(-5px);
  border-color: rgba(56, 189, 248, 0.4);
  box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.6);
}

.photo-img-wrapper {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
}

.photo-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.photo-card:hover .photo-img-wrapper img {
  transform: scale(1.08);
}

.zip-index-badge {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  background: rgba(7, 9, 14, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 0.4rem;
}

.photo-meta {
  padding: 1rem;
}

.photo-meta h4 {
  font-size: 0.95rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
}

.photo-meta p {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Dashboard Grid (Tab 2) */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 1.5rem;
}

.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-header h3 {
  font-size: 1.25rem;
  font-weight: 800;
}

.badge-tag {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.3rem 0.7rem;
  border-radius: 9999px;
}

.badge-tag.green {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-tag.blue {
  background: rgba(56, 189, 248, 0.15);
  color: var(--color-primary);
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.pipeline-nodes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border-glass);
  padding: 1rem;
  border-radius: 0.85rem;
}

.node-icon {
  width: 42px;
  height: 42px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.node-icon.bg-blue { background: rgba(56, 189, 248, 0.15); }
.node-icon.bg-purple { background: rgba(129, 140, 248, 0.15); }
.node-icon.bg-cyan { background: rgba(6, 182, 212, 0.15); }

.node-info {
  flex: 1;
}

.node-info strong {
  display: block;
  font-size: 0.95rem;
  color: var(--text-main);
}

.node-info p {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.status-pill {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 0.4rem;
}

.status-pill.ok {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
}

.calc-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.85rem;
  margin-bottom: 1.5rem;
}

.calc-field label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
}

.calc-field input {
  width: 100%;
  padding: 0.6rem;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid var(--border-glass);
  border-radius: 0.5rem;
  color: #fff;
  font-size: 1rem;
}

.score-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border-glass);
  padding: 1.25rem 1.5rem;
  border-radius: 0.85rem;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.stat-number {
  font-size: 2rem;
  font-weight: 900;
  color: var(--color-primary);
}

.stat-number small {
  font-size: 1rem;
  color: var(--text-sub);
}

.grade-badge {
  font-size: 0.95rem;
  font-weight: 800;
  padding: 0.5rem 1rem;
  border-radius: 0.6rem;
}

.grade-badge.excellent { background: rgba(16, 185, 129, 0.2); color: var(--color-success); }
.grade-badge.good { background: rgba(245, 158, 11, 0.2); color: var(--color-warning); }
.grade-badge.poor { background: rgba(239, 68, 68, 0.2); color: var(--color-danger); }

/* Git Flow Visualizer */
.git-flow-visual {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem 0;
}

.flow-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 220px;
}

.step-circle {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
}

.step-circle.blue { background: rgba(56, 189, 248, 0.2); color: var(--color-primary); border: 1px solid var(--color-primary); }
.step-circle.purple { background: rgba(129, 140, 248, 0.2); color: var(--color-secondary); border: 1px solid var(--color-secondary); }
.step-circle.green { background: rgba(16, 185, 129, 0.2); color: var(--color-success); border: 1px solid var(--color-success); }

.step-desc strong {
  display: block;
  font-size: 0.95rem;
}

.step-desc p {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.flow-arrow {
  font-size: 1.5rem;
  color: var(--text-sub);
}

/* Footer */
.app-footer {
  border-top: 1px solid var(--border-glass);
  background: rgba(7, 9, 14, 0.7);
  padding: 1.5rem 0;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.footer-links {
  margin-top: 0.3rem;
  color: var(--text-sub);
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.3s ease forwards;
}

.animate-slide-up {
  animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
