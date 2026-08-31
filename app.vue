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
          <span>🎨 Flux Anime Studio & Queue</span>
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
      <!-- TAB 1: AI GENERATOR & SELECTION QUEUE -->
      <section v-if="activeTab === 'generator'" class="tab-panel animate-fade-in">
        <div class="hero-section">
          <div class="badge-hero">
            <span class="badge-icon">✨</span>
            <span>Modèle : <code>Sawata97/flux2_4b_koni_animestyle</code></span>
          </div>
          <h1 class="hero-title">Générateur d'Art Anime & Archivage Asynchrone</h1>
          <p class="hero-subtitle">
            Générez des illustrations de style anime uniques avec FLUX, sélectionnez manuellement les pépites et envoyez-les dans le worker Pub/Sub pour archivage.
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
                <span v-if="!queuing">📦 Envoyer la sélection au Worker ({{ selectedImagesCount }})</span>
                <span v-else class="flex-align"><span class="spinner"></span> Publication Pub/Sub...</span>
              </button>
            </div>
          </div>

          <!-- Notification Bannière Queue -->
          <div v-if="queueSuccessMessage" class="job-success-banner animate-slide-up">
            <div class="banner-icon">🚀</div>
            <div class="banner-content">
              <strong>Sélection transmise avec succès au Worker Pub/Sub !</strong>
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
              <p class="section-hint">Cliquez sur une image ou cochez-la pour l'inclure dans l'archive ZIP.</p>
            </div>
            <div class="gallery-actions">
              <button class="btn btn-sm btn-outline" @click="selectAll">Tout sélectionner</button>
              <button class="btn btn-sm btn-outline" @click="deselectAll">Tout désélectionner</button>
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
                <div class="selection-checkbox">
                  <span v-if="item.selected">✓</span>
                </div>
                <span class="gen-badge">FLUX 2.4B</span>
              </div>
              <div class="card-meta">
                <p class="meta-prompt">{{ item.prompt }}</p>
                <span class="meta-time">{{ item.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 2: DEVOPS CI/CD DASHBOARD -->
      <section v-else class="tab-panel animate-fade-in">
        <div class="hero-section">
          <div class="badge-hero">
            <span class="badge-icon">🚀</span>
            <span>Infrastructure & Pipeline Metrics</span>
          </div>
          <h1 class="hero-title">Continuous Integration & Delivery Analytics</h1>
          <p class="hero-subtitle">
            Surveillance en temps réel de la chaîne d'automatisation GitHub Actions, Docker OCI et Git Flow.
          </p>
        </div>

        <div class="dashboard-grid">
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
        <p>Projet Guapa • FLUX Anime Generation & DevOps Platform par <strong>Ethan Carollo</strong></p>
        <div class="footer-links">
          <span>Nuxt 3</span> • <span>Hugging Face FLUX</span> • <span>GCP PubSub</span> • <span>Docker GHCR</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { calculateDevopsScore } from './utils/devops'

const activeTab = ref<'generator' | 'devops'>('generator')
const appVersion = ref('1.5.0')
const currentEnv = ref(process.env.NODE_ENV === 'production' ? 'Production' : 'Staging / Local')

// FLUX Generation State
const prompt = ref('cyberpunk anime girl with glowing cyan hair, holographic headphones, rain reflection, vibrant colors')
const generating = ref(false)
const queuing = ref(false)
const queueSuccessMessage = ref('')

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  time: string
  selected: boolean
}

const generatedList = ref<GeneratedImage[]>([
  {
    id: 'gen-1',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=700&auto=format&fit=crop&q=85',
    prompt: 'Koni Anime style, futuristic cyber samurai, neon katana, high quality 8k',
    time: 'Il y a 2 min',
    selected: true
  },
  {
    id: 'gen-2',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=700&auto=format&fit=crop&q=85',
    prompt: 'Ethereal anime princess in cosmic nebula gown, glowing stardust particles',
    time: 'Il y a 5 min',
    selected: true
  },
  {
    id: 'gen-3',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=700&auto=format&fit=crop&q=85',
    prompt: 'Anime landscape, floating crystal islands over sunset sea, studio ghibli vibe',
    time: 'Il y a 12 min',
    selected: false
  },
  {
    id: 'gen-4',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=700&auto=format&fit=crop&q=85',
    prompt: 'Neon synthwave anime city alley, retro aesthetic, volumetric lighting',
    time: 'Il y a 20 min',
    selected: true
  }
])

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

  try {
    const res = await $fetch('/api/generate-image', {
      method: 'POST',
      body: { prompt: prompt.value }
    })

    if (res.success && res.imageUrl) {
      generatedList.value.unshift({
        id: `gen-${Date.now()}`,
        url: res.imageUrl,
        prompt: prompt.value,
        time: "À l'instant",
        selected: true
      })
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
    const res = await $fetch('/api/zip', {
      method: 'POST',
      body: {
        images: selected.map(s => s.url),
        tags: 'flux-koni-selected'
      }
    })

    queueSuccessMessage.value = `${selected.length} image(s) sélectionnée(s) envoyée(s) dans le pipeline Cloud Storage & Pub/Sub.`
  } catch (err: any) {
    queueSuccessMessage.value = `Erreur: ${err.message}`
  } finally {
    queuing.value = false
  }
}

// DevOps Metrics
const testsPassed = ref(7)
const totalTests = ref(7)
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

.nav-pills { display: flex; background: rgba(15, 23, 42, 0.8); padding: 0.3rem; border-radius: 9999px; border: 1px solid var(--border-glass); }
.nav-pill { background: transparent; border: none; color: var(--text-muted); font-size: 0.9rem; font-weight: 600; padding: 0.5rem 1.25rem; border-radius: 9999px; cursor: pointer; transition: all 0.2s ease; }
.nav-pill:hover { color: var(--text-main); }
.nav-pill.active { background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(129, 140, 248, 0.2)); color: var(--color-primary); border: 1px solid rgba(56, 189, 248, 0.4); box-shadow: 0 0 15px rgba(56, 189, 248, 0.2); }

.nav-status { display: flex; align-items: center; gap: 1rem; }
.pulse-indicator { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-muted); }
.pulse-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--color-success); box-shadow: 0 0 10px var(--color-success); }
.version-badge { font-family: var(--font-mono); font-size: 0.8rem; padding: 0.25rem 0.6rem; background: rgba(255, 255, 255, 0.06); border: 1px solid var(--border-glass); border-radius: 0.5rem; color: var(--color-secondary); }

.main-content { flex: 1; max-width: 1200px; width: 100%; margin: 0 auto; padding: 2.5rem 1.5rem; position: relative; z-index: 10; }
.hero-section { text-align: center; margin-bottom: 2.5rem; }
.badge-hero { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(56, 189, 248, 0.1); color: var(--color-primary); border: 1px solid rgba(56, 189, 248, 0.3); padding: 0.4rem 1.25rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1.25rem; }
.hero-title { font-size: 2.5rem; font-weight: 900; line-height: 1.2; letter-spacing: -0.02em; background: linear-gradient(135deg, #ffffff 30%, #94a3b8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.75rem; }
.hero-subtitle { color: var(--text-muted); font-size: 1.1rem; max-width: 680px; margin: 0 auto; line-height: 1.5; }

/* Prompt Card */
.prompt-card { margin-bottom: 2.5rem; }
.card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem; }
.model-tag { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; color: var(--color-primary); }
.dot-pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary); box-shadow: 0 0 8px var(--color-primary); }
.preset-pills { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.pill-btn { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-glass); color: var(--text-muted); font-size: 0.75rem; padding: 0.3rem 0.75rem; border-radius: 9999px; cursor: pointer; transition: all 0.2s; }
.pill-btn:hover { background: rgba(56, 189, 248, 0.15); color: var(--color-primary); border-color: rgba(56, 189, 248, 0.3); }

.prompt-input-group textarea { width: 100%; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-glass); border-radius: 0.85rem; padding: 1rem; color: #fff; font-size: 1rem; outline: none; resize: vertical; margin-bottom: 1rem; transition: border-color 0.2s; }
.prompt-input-group textarea:focus { border-color: var(--color-primary); }
.prompt-actions { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: flex-end; }

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

.card-image-wrap { position: relative; width: 100%; height: 260px; overflow: hidden; background: #000; }
.card-image-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
.anime-card:hover .card-image-wrap img { transform: scale(1.05); }

.selection-checkbox { position: absolute; top: 0.75rem; right: 0.75rem; width: 26px; height: 26px; border-radius: 50%; background: rgba(7, 9, 14, 0.75); border: 2px solid #fff; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 900; font-size: 0.85rem; backdrop-filter: blur(6px); }
.anime-card.is-selected .selection-checkbox { background: var(--color-primary); border-color: var(--color-primary); color: #000; }

.gen-badge { position: absolute; bottom: 0.75rem; left: 0.75rem; background: rgba(7, 9, 14, 0.8); backdrop-filter: blur(6px); border: 1px solid rgba(255, 255, 255, 0.15); color: var(--color-secondary); font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 0.4rem; }

.card-meta { padding: 1rem; }
.meta-prompt { font-size: 0.85rem; color: var(--text-main); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 0.5rem; }
.meta-time { font-size: 0.75rem; color: var(--text-sub); }

/* Dashboard tab 2 */
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
