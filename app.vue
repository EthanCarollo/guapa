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
        <span class="brand-title">GUAPA<span class="brand-accent">.AI</span></span>
      </div>

      <div class="nav-pills">
        <button
          :class="['nav-pill', activeTab === 'generator' ? 'active' : '']"
          @click="activeTab = 'generator'"
        >
          <span>🎨 Flux Anime Studio</span>
        </button>
        <button
          :class="['nav-pill', activeTab === 'archives' ? 'active' : '']"
          @click="switchToArchives"
        >
          <span>📦 Archives ZIP Firebase <span class="tab-badge" v-if="storedZips.length">{{ storedZips.length }}</span></span>
        </button>
        <button
          :class="['nav-pill', activeTab === 'devops' ? 'active' : '']"
          @click="activeTab = 'devops'"
        >
          <span>📊 CI/CD Dashboard</span>
        </button>
      </div>

      <div class="nav-status">
        <!-- Auth Status Block (Firebase Google Sign-In) -->
        <div v-if="user" class="user-profile-badge">
          <img v-if="user.photoURL" :src="user.photoURL" :alt="user.displayName || 'User'" class="user-avatar" />
          <div v-else class="user-avatar-placeholder">{{ (user.displayName || user.email || 'U')[0].toUpperCase() }}</div>
          <div class="user-meta">
            <span class="user-name">{{ user.displayName || user.email?.split('@')[0] }}</span>
            <span class="user-badge-auth">Google Auth ✓</span>
          </div>
          <button class="btn-logout" title="Se déconnecter" @click="handleLogout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
        <div v-else class="user-login-trigger">
          <button class="btn btn-sm btn-google" :disabled="authLoading" @click="handleLogin">
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Connexion Google</span>
          </button>
        </div>

        <div class="pulse-indicator">
          <span class="pulse-dot"></span>
          <span class="status-label">{{ currentEnv }}</span>
        </div>
        <span class="version-badge">v{{ appVersion }}</span>
      </div>
    </nav>

    <!-- Auth Alert Banner if not logged in -->
    <div v-if="!user && !authLoading" class="auth-required-banner">
      <div class="auth-banner-content">
        <span class="auth-banner-icon">🔒</span>
        <div>
          <strong>Authentification Firebase requise</strong>
          <p>Connectez-vous avec votre compte Google pour générer des illustrations et synchroniser vos ZIPs sur Firebase Realtime Database.</p>
        </div>
      </div>
      <button class="btn btn-sm btn-google-banner" @click="handleLogin">
        ⚡ Se connecter avec Google
      </button>
    </div>

    <!-- Main Container -->
    <main class="main-content">
      <!-- TAB 1: AI GENERATOR & SELECTION QUEUE -->
      <section v-if="activeTab === 'generator'" class="tab-panel animate-fade-in">
        <div class="hero-section">
          <div class="badge-hero">
            <span class="badge-icon">✨</span>
            <span>Modèle : <code>Sawata97/flux2_4b_koni_animestyle</code></span>
          </div>
          <h1 class="hero-title">Générateur d'Art Anime & Archivage Firebase</h1>
          <p class="hero-subtitle">
            Générez des illustrations anime avec FLUX, sélectionnez vos pépites et archivez-les dans Firebase Realtime Database sous <code>/{{ userPrenom }}/heureduzippage/filename</code> pour survivre aux redémarrages.
          </p>
        </div>

        <!-- Prompt Studio Card -->
        <div class="glass-card prompt-card">
          <div class="card-header-flex">
            <div class="model-tag">
              <span class="dot-pulse"></span>
              <span>Inference Studio • FLUX 2.4B Koni</span>
            </div>
            <div class="preset-pills">
              <button class="pill-btn" @click="prompt = 'cyberpunk anime girl, neon lights, shibuya rain, masterpiece, 8k'">🌆 Cyberpunk</button>
              <button class="pill-btn" @click="prompt = 'magical fantasy anime sorceress, ethereal glow, floating crystals, vibrant'">🔮 Fantasy</button>
              <button class="pill-btn" @click="prompt = 'mecha pilot anime character in futuristic cockpit, detailed armor, cinematic'">🤖 Mecha</button>
            </div>
          </div>

          <div class="prompt-input-group">
            <textarea
              v-model="prompt"
              rows="3"
              placeholder="Décrivez votre illustration anime (ex: 1girl, sakura tree, sunset breeze, highly detailed)..."
            ></textarea>
            <div class="prompt-actions">
              <label class="auto-download-toggle">
                <input type="checkbox" v-model="autoDownloadZip" />
                <span>⚡ Auto-téléchargement ZIP en flux</span>
              </label>

              <button
                class="btn btn-primary"
                :disabled="generating || !prompt.trim()"
                @click="generateImage"
              >
                <span v-if="!generating">⚡ Générer l'image</span>
                <span v-else class="flex-align"><span class="spinner"></span> Synthèse FLUX...</span>
              </button>

              <button
                class="btn btn-gradient"
                :disabled="selectedImagesCount === 0 || queuing"
                @click="sendSelectedToQueue"
              >
                <span v-if="!queuing">📦 Envoyer & Sauvegarder Firebase ({{ selectedImagesCount }})</span>
                <span v-else class="flex-align"><span class="spinner"></span> Stream ZIP & Sync Firebase...</span>
              </button>
            </div>
          </div>

          <!-- Notification Bannière Queue -->
          <div v-if="queueSuccessMessage" class="job-success-banner animate-slide-up">
            <div class="banner-icon">🚀</div>
            <div class="banner-content">
              <strong>Archive enregistrée avec succès dans Firebase Realtime Database !</strong>
              <p>{{ queueSuccessMessage }}</p>
            </div>
            <button class="btn btn-sm btn-outline" @click="queueSuccessMessage = ''">Fermer</button>
          </div>
        </div>

        <!-- Generated & Selectable Images Gallery -->
        <div class="gallery-container">
          <div class="gallery-header">
            <div>
              <h2>Galerie d'œuvres générées ({{ generatedList.length }})</h2>
              <p class="section-hint">Sélectionnez les images à regrouper dans l'archive ZIP persistée.</p>
            </div>
            <div class="gallery-actions">
              <button class="btn btn-sm btn-outline" @click="selectAll">Tout sélectionner</button>
              <button class="btn btn-sm btn-outline" @click="deselectAll">Tout désélectionner</button>
              <button
                class="btn btn-sm btn-primary"
                :disabled="selectedImagesCount === 0 || downloadingZip"
                @click="downloadZipStream()"
              >
                <span v-if="!downloadingZip">⬇️ Télécharger ZIP ({{ selectedImagesCount }})</span>
                <span v-else class="flex-align"><span class="spinner"></span> Compression & Sync...</span>
              </button>
            </div>
          </div>

          <div class="anime-grid">
            <div
              v-for="(item, index) in generatedList"
              :key="item.id"
              :class="['anime-card', item.selected ? 'is-selected' : '']"
              @click="toggleSelect(item)"
            >
              <div class="card-image-wrap">
                <img :src="item.url" :alt="item.prompt" loading="lazy" />
                <div class="image-loader-shimmer"></div>
                <div class="selection-checkbox">
                  <span v-if="item.selected">✓</span>
                </div>
                <span class="gen-badge">FLUX 2.4B</span>
              </div>
              <div class="card-meta">
                <p class="meta-prompt">{{ item.prompt }}</p>
                <div class="meta-sub">
                  <span class="meta-seed">🎲 Seed: {{ item.seed }}</span>
                  <span class="meta-time">{{ item.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 2: ARCHIVES ZIP & FIREBASE REALTIME DB (TP PART II) -->
      <section v-else-if="activeTab === 'archives'" class="tab-panel animate-fade-in">
        <div class="hero-section">
          <div class="badge-hero">
            <span class="badge-icon">🔥</span>
            <span>Firebase Realtime DB : <code>ecni2-2026-default-rtdb</code></span>
          </div>
          <h1 class="hero-title">Archives ZIP Persistées sur Firebase</h1>
          <p class="hero-subtitle">
            Ces archives ont été sauvegardées dans Firebase sous <code>/{{ userPrenom }}/heureduzippage/filename</code> et survivent aux redémarrages de l'instance.
          </p>
        </div>

        <div class="archives-controls">
          <div class="archives-stats-grid">
            <div class="stat-card">
              <span class="stat-card-title">Total Archives</span>
              <span class="stat-card-value">{{ storedZips.length }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-card-title">Branche Firebase</span>
              <span class="stat-card-value highlight-cyan">/{{ userPrenom }}/*</span>
            </div>
            <div class="stat-card">
              <span class="stat-card-title">Bucket GCS</span>
              <span class="stat-card-value highlight-purple">ecni22026bucket</span>
            </div>
          </div>

          <div class="archives-actions-bar">
            <button class="btn btn-outline" :disabled="loadingZips" @click="fetchStoredZips">
              <span v-if="!loadingZips">🔄 Actualiser depuis Firebase</span>
              <span v-else class="flex-align"><span class="spinner"></span> Lecture RTDB...</span>
            </button>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="storedZips.length === 0 && !loadingZips" class="empty-archives-card">
          <div class="empty-icon">📂</div>
          <h3>Aucune archive ZIP trouvée pour /{{ userPrenom }}</h3>
          <p>Générez des images dans l'onglet Studio et téléchargez une sélection pour l'archiver dans Firebase.</p>
          <button class="btn btn-primary" @click="activeTab = 'generator'">Aller au Studio FLUX</button>
        </div>

        <!-- Archives Grid -->
        <div v-else class="archives-grid">
          <div v-for="zip in storedZips" :key="zip.firebasePath || zip.filename" class="archive-card">
            <div class="archive-card-header">
              <div class="archive-icon">📦</div>
              <div class="archive-header-info">
                <h4 class="archive-filename">{{ zip.filename }}</h4>
                <span class="archive-date">🕒 {{ formatDate(zip.createdAt) }}</span>
              </div>
              <span class="badge-tag green">Sauvegardé RTDB</span>
            </div>

            <div class="archive-details">
              <div class="detail-row">
                <span class="detail-label">Chemin Firebase :</span>
                <code class="detail-code cyan">{{ zip.firebasePath }}</code>
              </div>
              <div class="detail-row">
                <span class="detail-label">Google Cloud Storage :</span>
                <code class="detail-code purple">{{ zip.gcsPath }}</code>
              </div>
              <div class="detail-row">
                <span class="detail-label">Contenu :</span>
                <span class="detail-value"><strong>{{ zip.imagesCount }}</strong> image(s) • {{ formatBytes(zip.sizeBytes) }}</span>
              </div>
            </div>

            <div class="archive-card-footer">
              <a
                :href="zip.downloadUrl || zip.cloudUrl"
                :download="zip.filename"
                class="btn btn-sm btn-gradient download-btn-link"
              >
                ⬇️ Télécharger le fichier ZIP
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 3: DEVOPS CI/CD DASHBOARD -->
      <section v-else class="tab-panel animate-fade-in">
        <div class="hero-section">
          <div class="badge-hero">
            <span class="badge-icon">🚀</span>
            <span>Infrastructure & Pipeline Metrics</span>
          </div>
          <h1 class="hero-title">Continuous Integration & Delivery Analytics</h1>
          <p class="hero-subtitle">
            Surveillance en temps réel de la chaîne d'automatisation GitHub Actions, Docker OCI, Firebase RTDB et Git Flow.
          </p>
        </div>

        <div class="dashboard-grid">
          <div class="glass-card">
            <div class="card-header">
              <h3>⚡ État des Services & Cloud</h3>
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
                <div class="node-icon bg-orange">🔥</div>
                <div class="node-info">
                  <strong>Firebase Realtime DB & Auth</strong>
                  <p>Projet: ecni2-2026 • RTDB: ecni2-2026-default-rtdb</p>
                </div>
                <span class="status-pill ok">CONNECTED</span>
              </div>
              <div class="node-item">
                <div class="node-icon bg-cyan">🎨</div>
                <div class="node-info">
                  <strong>Hugging Face AI Engine</strong>
                  <p>Model: Sawata97/flux2_4b_koni_animestyle</p>
                </div>
                <span class="status-pill ok">READY</span>
              </div>
            </div>
          </div>

          <div class="glass-card">
            <div class="card-header">
              <h3>🎯 Simulateur Qualité & CI</h3>
              <span class="badge-tag blue">Algorithme V2</span>
            </div>
            <div class="calc-inputs">
              <div class="calc-field">
                <label>Tests unitaires réussis</label>
                <input v-model.number="testsPassed" type="number" min="0" :max="totalTests" />
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
        </div>
      </section>
    </main>

    <footer class="app-footer">
      <div class="footer-content">
        <p>Projet Guapa • FLUX Anime Generation, Firebase Realtime Database & DevOps Platform par <strong>Ethan Carollo</strong></p>
        <div class="footer-links">
          <span>Nuxt 3</span> • <span>Firebase RTDB</span> • <span>Firebase Auth</span> • <span>Google Cloud Storage</span> • <span>Docker GHCR</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { calculateDevopsScore } from './utils/devops'
import { useAuth } from './composables/useAuth'

const { user, loading: authLoading, loginWithGoogle, logout } = useAuth()

const activeTab = ref<'generator' | 'archives' | 'devops'>('generator')
const appVersion = ref('1.9.0')
const currentEnv = ref(process.env.NODE_ENV === 'production' ? 'Production' : 'Staging / Local')

// FLUX Generation State
const prompt = ref('cyberpunk anime girl with glowing cyan hair, holographic headphones, rain reflection, vibrant colors')
const generating = ref(false)
const queuing = ref(false)
const downloadingZip = ref(false)
const autoDownloadZip = ref(true)
const queueSuccessMessage = ref('')

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  seed: number
  time: string
  selected: boolean
}

interface StoredZipRecord {
  filename: string
  images: string[]
  tags: string
  imagesCount: number
  sizeBytes?: number
  gcsPath?: string
  downloadUrl?: string
  cloudUrl?: string
  createdAt: string
  timestamp: number
  prenom: string
  firebasePath: string
}

const generatedList = ref<GeneratedImage[]>([])
const storedZips = ref<StoredZipRecord[]>([])
const loadingZips = ref(false)

const userPrenom = computed(() => {
  if (user.value?.displayName) {
    return user.value.displayName.split(' ')[0].toLowerCase().trim()
  }
  return 'ethan'
})

// Authentication Handlers
async function handleLogin() {
  try {
    await loginWithGoogle()
  } catch (e) {
    console.error('Login error:', e)
  }
}

async function handleLogout() {
  try {
    await logout()
  } catch (e) {
    console.error('Logout error:', e)
  }
}

// Charger toutes les images générées conservées sur le disque
async function loadStoredImages() {
  try {
    const res = await $fetch<{ images: any[] }>('/api/images')
    if (res.images && res.images.length > 0) {
      generatedList.value = res.images.map(img => ({
        ...img,
        selected: false
      }))
    }
  } catch (err) {
    console.error('Erreur chargement images stockées', err)
  }
}

// Charger les ZIPs persistés dans Firebase Realtime Database
async function fetchStoredZips() {
  loadingZips.value = true
  try {
    const res = await $fetch<{ success: boolean; zips: StoredZipRecord[] }>(`/api/zips?prenom=${userPrenom.value}`)
    if (res.success && Array.isArray(res.zips)) {
      storedZips.value = res.zips
    }
  } catch (err) {
    console.error('Erreur lors du chargement des ZIPs Firebase:', err)
  } finally {
    loadingZips.value = false
  }
}

function switchToArchives() {
  activeTab.value = 'archives'
  fetchStoredZips()
}

onMounted(() => {
  loadStoredImages()
  fetchStoredZips()
})

const selectedImagesCount = computed(() => {
  return generatedList.value.filter(i => i.selected).length
})

function toggleSelect(item: GeneratedImage) {
  item.selected = !item.selected
}

function selectAll() {
  generatedList.value.forEach(i => i.selected = true)
}

function deselectAll() {
  generatedList.value.forEach(i => i.selected = false)
}

async function generateImage() {
  if (!prompt.value.trim()) return
  generating.value = true
  const randomSeed = Math.floor(Math.random() * 2147483647)

  try {
    const res = await $fetch<any>('/api/generate-image', {
      method: 'POST',
      body: {
        prompt: prompt.value,
        seed: randomSeed
      }
    })

    if (res.success && res.url) {
      const newImg: GeneratedImage = {
        id: res.id || `gen-${Date.now()}-${randomSeed}`,
        url: res.url,
        prompt: res.prompt || prompt.value,
        seed: res.seed || randomSeed,
        time: res.time || "À l'instant",
        selected: true
      }
      generatedList.value.unshift(newImg)
    }
  } catch (err) {
    console.error('Erreur génération', err)
  } finally {
    generating.value = false
  }
}

async function sendSelectedToQueue() {
  const selected = generatedList.value.filter(i => i.selected)
  if (selected.length === 0) return

  queuing.value = true
  try {
    // 1. Déclencher le téléchargement et la synchronisation Firebase
    await downloadZipStream(selected)

    // 2. Publication au Worker Pub/Sub
    await $fetch<any>('/api/zip', {
      method: 'POST',
      body: {
        images: selected.map(s => s.url),
        tags: 'flux-koni-selected'
      }
    })

    // 3. Retirer les images envoyées de la sélection active
    const selectedIds = new Set(selected.map(s => s.id))
    generatedList.value = generatedList.value.filter(item => !selectedIds.has(item.id))

    queueSuccessMessage.value = `${selected.length} image(s) archivée(s) et sauvegardée(s) dans Firebase Realtime DB sous /${userPrenom.value}/ !`
    fetchStoredZips()
  } catch (err: any) {
    queueSuccessMessage.value = `Erreur: ${err.message}`
  } finally {
    queuing.value = false
  }
}

async function downloadZipStream(customList?: GeneratedImage[]) {
  const selected = Array.isArray(customList) ? customList : generatedList.value.filter(i => i.selected)
  if (!selected || selected.length === 0) return

  downloadingZip.value = true
  try {
    const response = await fetch('/api/download-zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images: selected.map(s => s.url),
        tags: 'flux-koni-archive',
        prenom: userPrenom.value
      })
    })

    if (!response.ok) {
      throw new Error(`Erreur téléchargement (${response.statusText})`)
    }

    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `flux-anime-${Date.now()}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)

    // Rafraîchir la liste des ZIPs Firebase
    setTimeout(() => {
      fetchStoredZips()
    }, 1000)
  } catch (err: any) {
    console.error('Erreur download ZIP:', err)
    queueSuccessMessage.value = `Erreur lors du téléchargement : ${err.message}`
  } finally {
    downloadingZip.value = false
  }
}

function formatDate(isoString?: string) {
  if (!isoString) return 'Date inconnue'
  try {
    const d = new Date(isoString)
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return isoString
  }
}

function formatBytes(bytes?: number) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// DevOps Metrics
const testsPassed = ref(13)
const totalTests = ref(13)
const coverage = ref(100)

const scoreResult = computed(() => {
  return calculateDevopsScore(testsPassed.value, totalTests.value, coverage.value)
})
</script>

<style>
/* Design System */
:root {
  --font-main: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --bg-dark: #07090e;
  --bg-card: rgba(15, 23, 42, 0.65);
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

.app-layout {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.glow-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(130px);
  pointer-events: none;
  z-index: 0;
}

.orb-primary { width: 500px; height: 500px; background: rgba(56, 189, 248, 0.12); top: -150px; left: 20%; }
.orb-secondary { width: 450px; height: 450px; background: rgba(129, 140, 248, 0.1); top: 30%; right: -100px; }
.orb-accent { width: 400px; height: 400px; background: rgba(192, 132, 252, 0.08); bottom: -100px; left: 5%; }

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

.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2.5rem;
  background: rgba(7, 9, 14, 0.75);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-glass);
}

.nav-brand { display: flex; align-items: center; gap: 0.75rem; }
.brand-logo { width: 38px; height: 38px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; }
.brand-title { font-size: 1.25rem; font-weight: 900; letter-spacing: 0.05em; color: #fff; }
.brand-accent { color: var(--color-primary); }

.nav-pills { display: flex; background: rgba(15, 23, 42, 0.8); padding: 0.3rem; border-radius: 9999px; border: 1px solid var(--border-glass); gap: 0.25rem; }
.nav-pill { background: transparent; border: none; color: var(--text-muted); font-size: 0.9rem; font-weight: 600; padding: 0.5rem 1.25rem; border-radius: 9999px; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 0.4rem; }
.nav-pill:hover { color: var(--text-main); }
.nav-pill.active { background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(129, 140, 248, 0.2)); color: var(--color-primary); border: 1px solid rgba(56, 189, 248, 0.4); box-shadow: 0 0 15px rgba(56, 189, 248, 0.2); }
.tab-badge { background: rgba(56, 189, 248, 0.25); color: var(--color-primary); font-size: 0.75rem; padding: 0.1rem 0.45rem; border-radius: 9999px; font-weight: 800; }

.nav-status { display: flex; align-items: center; gap: 1rem; }

/* User profile in navbar */
.user-profile-badge { display: flex; align-items: center; gap: 0.6rem; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(56, 189, 248, 0.3); padding: 0.35rem 0.75rem; border-radius: 9999px; }
.user-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--color-primary); }
.user-avatar-placeholder { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: #000; font-weight: 800; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; }
.user-meta { display: flex; flex-direction: column; line-height: 1.1; }
.user-name { font-size: 0.85rem; font-weight: 700; color: #fff; }
.user-badge-auth { font-size: 0.68rem; color: var(--color-success); font-weight: 600; }
.btn-logout { background: transparent; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; padding: 0.2rem; transition: color 0.2s; }
.btn-logout:hover { color: var(--color-danger); }

.btn-google { background: rgba(255, 255, 255, 0.08); color: #fff; border: 1px solid var(--border-glass); display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: 9999px; }
.btn-google:hover { background: rgba(255, 255, 255, 0.15); border-color: rgba(255, 255, 255, 0.25); }

/* Auth required banner */
.auth-required-banner { background: linear-gradient(90deg, rgba(56, 189, 248, 0.12), rgba(129, 140, 248, 0.12)); border-bottom: 1px solid rgba(56, 189, 248, 0.25); padding: 0.75rem 2.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.auth-banner-content { display: flex; align-items: center; gap: 0.75rem; }
.auth-banner-icon { font-size: 1.25rem; }
.auth-banner-content strong { color: var(--color-primary); font-size: 0.9rem; }
.auth-banner-content p { color: var(--text-muted); font-size: 0.8rem; margin-top: 0.1rem; }
.btn-google-banner { background: var(--color-primary); color: #000; font-weight: 800; }
.btn-google-banner:hover { background: #fff; box-shadow: 0 0 15px rgba(56, 189, 248, 0.5); }

.pulse-indicator { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-muted); }
.pulse-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--color-success); box-shadow: 0 0 10px var(--color-success); }
.version-badge { font-family: var(--font-mono); font-size: 0.8rem; padding: 0.25rem 0.6rem; background: rgba(255, 255, 255, 0.06); border: 1px solid var(--border-glass); border-radius: 0.5rem; color: var(--color-secondary); }

.main-content { flex: 1; max-width: 1200px; width: 100%; margin: 0 auto; padding: 2.5rem 1.5rem; position: relative; z-index: 10; }
.hero-section { text-align: center; margin-bottom: 2.5rem; }
.badge-hero { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(56, 189, 248, 0.1); color: var(--color-primary); border: 1px solid rgba(56, 189, 248, 0.3); padding: 0.4rem 1.25rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1.25rem; }
.hero-title { font-size: 2.5rem; font-weight: 900; line-height: 1.2; letter-spacing: -0.02em; background: linear-gradient(135deg, #ffffff 30%, #94a3b8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.75rem; }
.hero-subtitle { color: var(--text-muted); font-size: 1.05rem; max-width: 720px; margin: 0 auto; line-height: 1.5; }
.hero-subtitle code { color: var(--color-primary); background: rgba(56, 189, 248, 0.1); padding: 0.1rem 0.4rem; border-radius: 0.3rem; font-family: var(--font-mono); }

/* Prompt Card */
.prompt-card { margin-bottom: 2.5rem; }
.card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem; }
.model-tag { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; color: var(--color-primary); }
.dot-pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary); box-shadow: 0 0 8px var(--color-primary); }
.preset-pills { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.pill-btn { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-glass); color: var(--text-muted); font-size: 0.75rem; padding: 0.3rem 0.75rem; border-radius: 9999px; cursor: pointer; transition: all 0.2s; }
.pill-btn:hover { background: rgba(56, 189, 248, 0.15); color: var(--color-primary); border-color: rgba(56, 189, 248, 0.3); }

.prompt-input-group textarea { width: 100%; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-glass); border-radius: 0.85rem; padding: 1rem; color: #fff; font-size: 1rem; outline: none; resize: vertical; margin-bottom: 1rem; transition: border-color 0.2s; }
.prompt-actions { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: flex-end; align-items: center; }
.auto-download-toggle { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; color: var(--color-primary); background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); padding: 0.6rem 1rem; border-radius: 0.75rem; cursor: pointer; user-select: none; transition: all 0.2s; }
.auto-download-toggle input { accent-color: var(--color-primary); width: 16px; height: 16px; cursor: pointer; }
.auto-download-toggle:hover { background: rgba(56, 189, 248, 0.15); border-color: var(--color-primary); }

/* Buttons */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem 1.5rem; border-radius: 0.75rem; font-weight: 700; font-size: 0.95rem; cursor: pointer; border: none; transition: all 0.2s ease; text-decoration: none; }
.btn-primary { background: rgba(56, 189, 248, 0.15); color: var(--color-primary); border: 1px solid rgba(56, 189, 248, 0.4); }
.btn-primary:hover:not(:disabled) { background: var(--color-primary); color: #000; box-shadow: 0 0 20px rgba(56, 189, 248, 0.4); }
.btn-gradient { background: linear-gradient(135deg, #38bdf8, #818cf8); color: #07090e; }
.btn-gradient:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(56, 189, 248, 0.5); }
.btn-outline { background: rgba(255, 255, 255, 0.05); color: var(--text-main); border: 1px solid var(--border-glass); }
.btn-outline:hover { background: rgba(255, 255, 255, 0.1); }
.btn-sm { padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: 0.5rem; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.flex-align { display: flex; align-items: center; gap: 0.5rem; }

/* Notification Banner */
.job-success-banner { margin-top: 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 0.85rem; padding: 1rem 1.25rem; }
.banner-icon { font-size: 1.5rem; }
.banner-content strong { color: var(--color-success); font-size: 0.95rem; }
.banner-content p { color: var(--text-muted); font-size: 0.85rem; }

/* Anime Grid */
.gallery-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.gallery-header h2 { font-size: 1.35rem; font-weight: 800; }
.section-hint { font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem; }
.gallery-actions { display: flex; gap: 0.5rem; }

.anime-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }
.anime-card { background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 1rem; overflow: hidden; cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.anime-card:hover { transform: translateY(-4px); border-color: rgba(56, 189, 248, 0.4); box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.6); }
.anime-card.is-selected { border-color: var(--color-primary); box-shadow: 0 0 0 2px var(--color-primary), 0 10px 25px -5px rgba(56, 189, 248, 0.4); }

.card-image-wrap { position: relative; width: 100%; height: 260px; overflow: hidden; background: #0e1626; }
.card-image-wrap img { position: relative; z-index: 2; width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; background-color: #0e1626; }
.image-loader-shimmer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, #0e1626 0%, #1e293b 50%, #0e1626 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite; z-index: 1; }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
.anime-card:hover .card-image-wrap img { transform: scale(1.05); }

.selection-checkbox { position: absolute; top: 0.75rem; right: 0.75rem; width: 26px; height: 26px; border-radius: 50%; background: rgba(7, 9, 14, 0.75); border: 2px solid #fff; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 900; font-size: 0.85rem; backdrop-filter: blur(6px); }
.anime-card.is-selected .selection-checkbox { background: var(--color-primary); border-color: var(--color-primary); color: #000; }

.gen-badge { position: absolute; bottom: 0.75rem; left: 0.75rem; background: rgba(7, 9, 14, 0.8); backdrop-filter: blur(6px); border: 1px solid rgba(255, 255, 255, 0.15); color: var(--color-secondary); font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 0.4rem; }

.card-meta { padding: 1rem; }
.meta-prompt { font-size: 0.85rem; color: var(--text-main); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 0.5rem; }
.meta-sub { display: flex; justify-content: space-between; align-items: center; }
.meta-seed { font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-primary); background: rgba(56, 189, 248, 0.1); padding: 0.15rem 0.4rem; border-radius: 0.3rem; }
.meta-time { font-size: 0.75rem; color: var(--text-sub); }

/* TAB 2: ARCHIVES STYLING */
.archives-controls { margin-bottom: 2rem; }
.archives-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.25rem; }
.stat-card { background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 1rem; padding: 1.25rem; }
.stat-card-title { font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.25rem; }
.stat-card-value { font-size: 1.6rem; font-weight: 900; color: #fff; font-family: var(--font-mono); }
.highlight-cyan { color: var(--color-primary); }
.highlight-purple { color: var(--color-secondary); }

.archives-actions-bar { display: flex; justify-content: flex-end; }

.empty-archives-card { background: var(--bg-card); border: 1px dashed var(--border-glass); border-radius: 1.25rem; padding: 3rem 2rem; text-align: center; }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; }
.empty-archives-card h3 { font-size: 1.3rem; margin-bottom: 0.5rem; }
.empty-archives-card p { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem; max-width: 480px; margin-left: auto; margin-right: auto; }

.archives-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
.archive-card { background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 1.15rem; padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s ease; }
.archive-card:hover { transform: translateY(-3px); border-color: rgba(56, 189, 248, 0.4); box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.5); }

.archive-card-header { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 1.25rem; }
.archive-icon { font-size: 1.8rem; }
.archive-header-info { flex: 1; }
.archive-filename { font-size: 0.95rem; font-weight: 800; word-break: break-all; color: #fff; font-family: var(--font-mono); }
.archive-date { font-size: 0.75rem; color: var(--text-muted); display: block; margin-top: 0.2rem; }

.archive-details { background: rgba(0, 0, 0, 0.25); border-radius: 0.75rem; padding: 0.85rem; margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
.detail-row { display: flex; flex-direction: column; gap: 0.15rem; }
.detail-label { font-size: 0.72rem; color: var(--text-sub); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
.detail-code { font-family: var(--font-mono); font-size: 0.75rem; word-break: break-all; padding: 0.2rem 0.4rem; border-radius: 0.3rem; background: rgba(255, 255, 255, 0.04); }
.detail-code.cyan { color: var(--color-primary); }
.detail-code.purple { color: var(--color-secondary); }
.detail-value { font-size: 0.85rem; color: var(--text-main); }

.archive-card-footer { display: flex; justify-content: stretch; }
.download-btn-link { width: 100%; text-align: center; }

/* Dashboard tab 3 */
.dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.badge-tag { font-size: 0.75rem; font-weight: 700; padding: 0.3rem 0.7rem; border-radius: 9999px; }
.badge-tag.green { background: rgba(16, 185, 129, 0.15); color: var(--color-success); border: 1px solid rgba(16, 185, 129, 0.3); }
.badge-tag.blue { background: rgba(56, 189, 248, 0.15); color: var(--color-primary); border: 1px solid rgba(56, 189, 248, 0.3); }

.pipeline-nodes { display: flex; flex-direction: column; gap: 1rem; }
.node-item { display: flex; align-items: center; gap: 1rem; background: rgba(15, 23, 42, 0.5); border: 1px solid var(--border-glass); padding: 1rem; border-radius: 0.85rem; }
.node-icon { width: 42px; height: 42px; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
.node-icon.bg-blue { background: rgba(56, 189, 248, 0.15); }
.node-icon.bg-purple { background: rgba(129, 140, 248, 0.15); }
.node-icon.bg-cyan { background: rgba(6, 182, 212, 0.15); }
.node-icon.bg-orange { background: rgba(249, 115, 22, 0.15); }
.node-info { flex: 1; }
.node-info strong { display: block; font-size: 0.95rem; }
.node-info p { font-size: 0.8rem; color: var(--text-muted); }
.status-pill { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 0.4rem; }
.status-pill.ok { background: rgba(16, 185, 129, 0.15); color: var(--color-success); }

.calc-inputs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.85rem; margin-bottom: 1.5rem; }
.calc-field label { display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.4rem; }
.calc-field input { width: 100%; padding: 0.6rem; background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-glass); border-radius: 0.5rem; color: #fff; font-size: 1rem; }

.score-card-footer { display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.5); border: 1px solid var(--border-glass); padding: 1.25rem 1.5rem; border-radius: 0.85rem; }
.stat-label { display: block; font-size: 0.8rem; color: var(--text-muted); }
.stat-number { font-size: 2rem; font-weight: 900; color: var(--color-primary); }
.stat-number small { font-size: 1rem; color: var(--text-sub); }
.grade-badge { font-size: 0.95rem; font-weight: 800; padding: 0.5rem 1rem; border-radius: 0.6rem; }
.grade-badge.excellent { background: rgba(16, 185, 129, 0.2); color: var(--color-success); }
.grade-badge.good { background: rgba(245, 158, 11, 0.2); color: var(--color-warning); }
.grade-badge.poor { background: rgba(239, 68, 68, 0.2); color: var(--danger); }

/* Footer */
.app-footer { border-top: 1px solid var(--border-glass); background: rgba(7, 9, 14, 0.75); padding: 1.5rem 0; text-align: center; font-size: 0.85rem; color: var(--text-muted); }
.footer-links { margin-top: 0.3rem; color: var(--text-sub); }

.animate-fade-in { animation: fadeIn 0.3s ease forwards; }
.animate-slide-up { animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

.spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
