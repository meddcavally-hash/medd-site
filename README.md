# Site officiel du MEDD

Site vitrine institutionnel du **Mouvement des Enseignants pour la Dynamique de la Dignité (MEDD)**.

⚠️ Ce projet est indépendant de l'application MEDD (`Medd-app`) : aucun code n'est partagé entre
les deux dépôts. **Une seule exception, volontaire** : la page `organisation.html` lit la liste publique
des Secrétaires Généraux (régionaux, lycées et collèges, CAFOP, IEPP) dans le registre des responsables
de l'application, via la fonction Supabase `responsables_publics()` (responsables actifs uniquement,
sans matricule), avec la clé publique (anon) du projet. Le script est `assets/js/organisation.js`.
Les listes écrites en dur dans `organisation.html` restent la liste de secours : elles s'affichent si la
lecture échoue ou renvoie une liste vide, et sont rafraîchies à la demande depuis le registre.

## Stack

- HTML / CSS / JS vanilla — pas de framework, pas de dépendance de build.
- Aucun backend propre : site statique ; seule la page Organisation lit une fonction publique Supabase (voir ci-dessus).
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
│   ├── js/organisation.js (listes des SG lues dans le registre — page Organisation)
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
