# Mystic Tattoo - Site Web (React)

## 🚀 Présentation du Projet

**Mystic Tattoo** est un projet de création d'un site web professionnel pour un salon de tatouage situé à Nancy (54000). L'objectif est de proposer un site moderne, réactif et optimisé pour le référencement naturel (SEO). Le projet inclut notamment une galerie dynamique par catégorie de styles de tatouage, ainsi qu'un système de réservation en ligne avec administration sécurisée.

---

## 🛠 Technologies et Outils utilisés

- **React** (création UI dynamique et réactive)
- **React Router** (navigation et gestion des routes)
- **Framer Motion** (animations fluides et interactives)
- **Webpack** (gestion automatique des assets)
- **Sass (SCSS)** (gestion des styles avancés)
- **Git / GitHub** (gestion des versions et workflow)
- **GitHub Actions** (Intégration et Déploiement Continu)

---

## 🌳 Structure des branches

| Branche        | Usage / Objectif                                                     |
|----------------|----------------------------------------------------------------------|
| **main**       | Branche stable de **production** déployée sur le NAS Synology        |
| **release** ✅ | Version Release Candidate, stable, prête à être validée pour main    |
| **staging**    | Préproduction / Tests avant validation finale                        |

---

## 🔄 Workflow Git recommandé

1. Créer une branche `feature-xxx` à partir de `staging`
2. Développer la fonctionnalité, tester localement
3. Faire une Pull Request sur la branche `staging`
4. Fusionner `staging` vers `release` une fois validé
5. Tester la release sur l'environnement prévu
6. Fusionner `release` vers `main` pour le déploiement final en production

---

## 📦 Installation du projet

### Cloner le dépôt

```bash
git clone https://github.com/micka-sudo/mystictattoo-react.git
cd mystictattoo-react
```

### Installer les dépendances

```bash
npm install
```

### Démarrer en mode développement

```bash
npm start
```

Ouvrir l'application sur :
```
http://localhost:3000
```

### Construire l'application pour la production

```bash
Commande | Description
npm run dev | Démarre le frontend localement
npm run build | Build optimisé pour la prod
npm run preview | Lance un aperçu local du build
npm run lint | Linter ESLint + Prettier
```

---

## 🚧 Déploiement continu sur NAS Synology

Le déploiement continu est automatisé via **GitHub Actions** et les branches spécifiques déclenchent des déploiements automatiques :

- `staging` → préproduction
- `release` → release candidate (pré-prod finale)
- `main` → production

Voir le fichier d'action : `.github/workflows/ci-cd.yml`

---

## 📌 Optimisation SEO

- Structure HTML sémantique
- Référencement optimisé avec React Helmet (balises meta)
- URLs claires et structurées
- Site rapide et responsive (optimisation images, CSS/JS)

---

## 📁 Structure du Projet

```bash
mystictattoo-react/
├── public/
│   └── images/
├── src/
│   ├── assets/ (styles, images, icônes)
│   ├── components/ (composants réutilisables)
│   ├── pages/ (pages principales du site)
│   ├── App.js
│   └── index.js
├── .github/workflows (CI/CD)
└── README.md
```

---

## 🎯 Fonctionnalités principales

- Galerie d'images dynamique par style de tatouage
- Formulaire de réservation avec gestion admin
- Interface admin sécurisée pour gestion du contenu
- Déploiement continu automatisé

---
🎨 Palette de couleurs
Nom | Couleur
Dark | #484748
Violet | #875c94
Light | #FEFEFE
Gris doux | #C7b8cc
Noir | #333333
## 📝 Auteur

- **Votre Nom / Pseudo GitHub :** [micka-sudo](https://github.com/micka-sudo)

---

## 📄 Licence

Ce projet est sous licence **Gruy**.
