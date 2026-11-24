# LMS Platform - Front-end React Fondamentaux (Sprint 3)

Application Front-end construite avec React 19 et Vite pour la plateforme LMS.

## Objectifs & Contraintes respectées
- **Hooks stricts** : Utilisation exclusive du hook `useState` (aucun appel d'effet de bord via `useEffect`).
- **Session en mémoire** : La session (token JWT, informations utilisateur, rôle certifié) est stockée uniquement dans l'état racine `App` (aucune persistance arbitraire dans `localStorage`).
- **Routage conditionnel sans bibliothèque externe** : Bascule dynamique entre `AdminLayout` et `LearnerLayout` selon le rôle retourné par l'API backend via un composant de garde `ProtectedView`.
- **Formulaires contrôlés** : Formulaires de connexion, de cours et d'utilisateurs entièrement contrôlés avec validation synchrone et préservation des saisies en cas d'erreur serveur.
- **Gestion explicite des erreurs HTTP** :
  - `401 Unauthorized` : Déconnexion et purge automatique de l'état pour retour à l'écran de login.
  - `403 Forbidden` : Maintien de la session avec affichage immédiat d'un panneau "Accès refusé".

## Installation et Démarrage

1. Cloner le projet :
\`\`\`bash
git clone https://github.com/amine-elarar/REACT_API.git
cd REACT_API
\`\`\`

2. Installer les dépendances :
\`\`\`bash
npm install
\`\`\`

3. Configurer l'environnement :
Copier le fichier `.env.example` en `.env` et renseigner l'URL de l'API backend :
\`\`\`bash
cp .env.example .env
\`\`\`
Exemple de configuration dans `.env` :
\`\`\`env
VITE_API_URL=http://13.48.171.128/api
\`\`\`

4. Lancer le serveur de développement :
\`\`\`bash
npm run dev
\`\`\`

5. Construire le livrable de production :
\`\`\`bash
npm run build
\`\`\`
