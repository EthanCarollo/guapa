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

## 🌐 Rendre le package GHCR public sur GitHub

Par défaut, GitHub crée les packages de conteneurs en privé liés au repository. Pour rendre l'image Docker publique (accessible sans authentification docker login) :
1. Va sur ton profil GitHub ou à la racine de ton repository `EthanCarollo/guapa`.
2. Clique sur l'onglet **Packages** (à droite ou dans ton profil).
3. Sélectionne le package `guapa`.
4. Clique sur **Package settings** (dans le menu latéral droit).
5. Descends tout en bas dans la section **Danger Zone** -> **Change package visibility**.
6. Sélectionne **Public** et valide.