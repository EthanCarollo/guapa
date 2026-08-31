# Guapa - Application Nuxt 3 (TP DevOps)

Projet Nuxt 3 démontrant une chaîne CI/CD complète avec **GitHub Actions**, **Vitest (Code Coverage)**, **Docker (GHCR)** et le workflow **Git Flow**.

---

## 🛠️ Stack & Outils
- **Framework :** Nuxt 3 / Vue 3 / Nitro Server
- **Tests :** Vitest + `@vitest/coverage-v8` + Coveralls
- **Conteneurisation :** Docker (Multi-stage build)
- **Registre Docker :** GitHub Packages (GHCR - `ghcr.io`)
- **CI/CD :** GitHub Actions (3 workflows automatisés)
- **Git Branching :** Git Flow (`main`, `develop`, `release/*`)

---

## 🚀 Commandes utiles

```bash
# Installation des dépendances
npm install

# Lancer en développement
npm run dev

# Lancer les tests unitaires
npm test

# Lancer les tests avec rapport de couverture (LCOV)
npm run test:coverage

# Compiler pour la production
npm run build

# Prévisualiser la production
npm run preview
```

---

## 🔄 Chaîne CI/CD (GitHub Actions)

1. **`tests.yml`** : Exécute les tests unitaires et le calcul de couverture de code à chaque `push` et `pull_request` sur `main` et `develop`.
2. **`docker-staging.yml`** : Se déclenche lors d'un push sur `develop`, construit l'image Docker et la publie sur GHCR avec le tag `:staging`.
3. **`docker-production.yml`** : Se déclenche lors d'un push sur `main` ou un tag Git de release (`v*.*.*`), construit et publie l'image avec le tag `:production`.

---

## 🌿 Commandes Git Flow pour la release

```bash
# 1. Initialiser une release (ex: 1.0.0)
git checkout -b release/1.0.0 develop

# 2. Merger dans main (production)
git checkout main
git merge --no-ff release/1.0.0
git tag -a v1.0.0 -m "Release v1.0.0"

# 3. Merger dans develop (staging)
git checkout develop
git merge --no-ff release/1.0.0
git branch -d release/1.0.0

# 4. Pousser tout sur GitHub pour déclencher les workflows
git push origin main --tags
git push origin develop
```