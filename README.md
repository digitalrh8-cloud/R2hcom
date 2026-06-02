# 🌐 Portail d'Administration Unified & CRM - R2H Communication

Ce dépôt contient le code source du portail d'administration unifié pour **r2h.ma**, **africapoolspa.com** et **gardenexpo.ma**, connecté à une base de données **MongoDB Atlas** de production et boosté par l'IA de **Google Gemini**.

---

## 🛠️ Connexion Directe avec GitHub & Déploiement

Pour connecter et synchroniser automatiquement votre base de données MongoDB avec votre dépôt GitHub pour le déploiement cloud (Vercel, Render, Railway, Google Cloud Run, etc.), suivez ce guide étape par étape :

### 1. Activer les Secrets GitHub (Sécurité des Identifiants)
Ne commettez **jamais** vos mots de passe MongoDB ou vos clés d'API directement dans le code source visible sur GitHub. Utilisez les **GitHub Secrets** :

1. Allez sur votre dépôt GitHub.
2. Cliquez sur l'onglet **Settings** (Paramètres).
3. Dans la barre latérale gauche, cliquez sur **Secrets and variables** > **Actions**.
4. Cliquez sur **New repository secret** (Nouveau secret de dépôt).
5. Ajoutez les secrets suivants :

| Nom du Secret | Description | Exemple de valeur |
| :--- | :--- | :--- |
| `MONGODB_URI` | Chaîne de connexion complète à votre cluster MongoDB Atlas | `mongodb+srv://Vercel-Admin-atlas-teal-house:mypassword@atlas-teal-house.egjqebb.mongodb.net/...` |
| `GEMINI_API_KEY` | Clé secrète de l'API Google Gemini pour la génération marketing | `al-9h46TwciYmr_nJg0xRgHn8oNvmRSoZJZ1MjtHEa79Ib` |
| `MONGO_DATABASE_NAME` | Le nom de la base de données cible dans MongoDB | `r2h` |

---

### 2. Déploiement Automatique via GitHub (CI/CD)

Grâce au fichier de configuration de flux de travail intégré (`.github/workflows/ci.yml`), chaque fois que vous ferez un `git push` sur la branche principale (`main`), GitHub exécutera automatiquement les étapes d'intégration continue :
- Validation de la syntaxe TypeScript (Linter).
- Compilation optimisée du code frontend avec Vite.
- Bundle de l'architecture backend Express sécurisée.

#### Options de Déploiement Cloud Recommandées :

#### Option A : Déploiement sur Vercel (Recommandé pour sa rapidité)
1. Créez un compte sur [Vercel](https://vercel.com).
2. Cliquez sur **Add New** > **Project** et importez votre dépôt GitHub.
3. Dans la section **Environment Variables**, renseignez la variable :
   - `MONGODB_URI` : *(votre chaîne de connexion Atlas)*
   - `GEMINI_API_KEY` : *(votre clé d'API)*
   - `MONGO_DATABASE_NAME` : `r2h`
4. Cliquez sur **Deploy**. Vercel gèrera l'installation et le démarrage automatique.

#### Option B : Déploiement sur Render ou Railway (Solution Full-Stack standard)
1. Créez un service Web de type **Web Service** lié à votre dépôt GitHub.
2. Définissez la commande de build : `npm run build`
3. Définissez la commande d'allumage (start command) : `npm start`
4. Ajoutez vos variables d'environnement dans l'onglet **Environment** de votre tableau de bord.

---

## ⚡ Architecture Technique Unifiée

L'application utilise une architecture full-stack robuste pour assurer un maximum de sécurité :

```
                  [ Front-End Client (React + Vite) ]
                                   │
                    (Requêtes sécurisées vers l'API interne)
                                   ▼
                [ Back-End Serveur (Express.js on Node) ]
                    │                              │
                    ▼                              ▼
          [ Google Gemini AI API ]      [ MongoDB Atlas Database ]
            (Génération d'emails)         (Stands, CRM & Transactions)
```

1. **Front-End client (`src/`)** : propulsé par React, Tailwind CSS pour des interfaces modernes ultra-rapides, et Lucide React pour les icônes.
2. **API Proxy Backend (`server.ts` & `db.ts`)** : les clés d'API (Gemini, MongoDB) restent uniquement du côté serveur et ne sont jamais exposées à l'utilisateur final dans son navigateur.
3. **Modèle de Données (`lib/mongodb.ts`)** : gère l'initialisation automatique, le seeding par défaut des stands, des prospects et des campagnes, et la synchronisation en temps réel.

---

## 🚀 Développement Local rapide

Pour faire tourner le portail en local sur votre ordinateur :

1. **Cloner le projet depuis votre GitHub** :
   ```bash
   git clone <url-de-votre-depot-github>
   cd react-example
   ```

2. **Installer les paquets de dépendance** :
   ```bash
   npm install
   ```

3. **Créer votre fichier local `.env`** :
   Remplissez les variables d'environnement locales (ce fichier est listé dans `.gitignore` et ne sera pas poussé en ligne) :
   ```env
   MONGODB_URI="votre_uri_mongodb_atlas"
   GEMINI_API_KEY="votre_cle_gemini"
   MONGO_DATABASE_NAME="r2h"
   ```

4. **Lancer le serveur de développement local** :
   ```bash
   npm run dev
   ```
   *Rendez-vous à l'adresse héliportée : http://localhost:3000*
