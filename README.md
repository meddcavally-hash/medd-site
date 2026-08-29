# Site officiel du MEDD

Site vitrine institutionnel du **Mouvement des Enseignants pour la Dynamique de la Dignité (MEDD)**.

⚠️ Ce projet est **totalement indépendant** de l'application MEDD (`Medd-app`) : aucun code,
aucune clé, aucune donnée n'est partagée entre les deux dépôts.

## Stack

- HTML / CSS / JS vanilla — pas de framework, pas de dépendance de build.
- Aucun backend : site 100% statique.
- Déploiement : Vercel (déploiement continu depuis GitHub).

## Structure

```
medd-site/
├── index.html          → Accueil
├── le-medd.html         → Présentation, missions, organisation
├── documents.html        → Statuts + Règlement intérieur (PDF)
├── contact.html          → Coordonnées
├── assets/
│   ├── css/style.css
│   ├── js/main.js         (menu mobile uniquement)
│   ├── images/logo-medd.jpg
│   └── docs/MEDD-Statuts-et-Reglement-Interieur.pdf
├── sitemap.xml
├── robots.txt
└── README.md
```

## Contenu en attente de validation

- Noms et fonctions des responsables actuels du MEDD (page `le-medd.html`, section Organisation).
- Coordonnées officielles : téléphone, email (page `contact.html`).
- Une fois l'email officiel communiqué : mise en place d'un formulaire de contact via un
  service EmailJS **dédié à ce site** (compte/clé séparés de l'application MEDD).

## Phase 2 / 3 (non développées, prévues pour plus tard)

- Page Organisation détaillée par région.
- Actualités / Communiqués.
- Événements, Galerie.
- Back-office léger pour publier actus/documents sans coder.

## Déploiement

1. Pousser ce dépôt sur GitHub (nouveau dépôt, séparé de `Medd-app`).
2. Importer le dépôt dans Vercel → déploiement automatique à chaque `git push`.
3. URL provisoire : `medd-site.vercel.app` (domaine personnalisé branchable plus tard).
