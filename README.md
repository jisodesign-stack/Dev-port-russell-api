# Port de Plaisance Russell - API

API de gestion du port de plaisance de Russell : catways, réservations et utilisateurs.

## 🌐 Application Hébergée

| Service | URL |
|---------|-----|
| **Application** | https://dev-port-russell-api-production.up.railway.app |
| **Documentation API** | https://dev-port-russell-api-production.up.railway.app/api-docs |
| **GitHub** | https://github.com/jisodesign-stack/Dev-port-russell-api |

### Identifiants de connexion (compte admin)
- **Email** : admin@port-russell.fr
- **Mot de passe** : admin123

## 🚀 Fonctionnalités

- Gestion des catways (CRUD)
- Gestion des réservations (CRUD)
- Gestion des utilisateurs (CRUD)
- Authentification JWT + sessions
- Tableau de bord avec statistiques
- Documentation Swagger

## 📋 Prérequis

- Node.js v18+
- MongoDB v6+

## 🛠️ Installation

```bash
# Cloner et installer
git clone <url-du-repo>
cd port-russell-api
npm install

# Configurer l'environnement
cp .env.example .env

# Importer les données
npm run import-data

# Lancer en développement
npm run dev
```

## 🌐 Accès Local

| Service | URL |
|---------|-----|
| Application | http://localhost:3000 |
| API Docs | http://localhost:3000/api-docs |

## 🔗 Routes API

### Catways
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /catways | Liste des catways |
| GET | /catways/:id | Détail d'un catway |
| POST | /catways | Créer un catway |
| PUT | /catways/:id | Modifier l'état |
| DELETE | /catways/:id | Supprimer |

### Réservations
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /reservations | Toutes les réservations |
| GET | /catways/:id/reservations | Réservations d'un catway |
| GET | /catways/:id/reservations/:idRes | Détail réservation |
| POST | /catways/:id/reservations | Créer |
| DELETE | /catways/:id/reservations/:idRes | Supprimer |

### Utilisateurs
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /users | Liste des utilisateurs |
| GET | /users/:email | Détail par email |
| POST | /users | Créer |
| PUT | /users/:email | Modifier |
| DELETE | /users/:email | Supprimer |

### Authentification
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /login | Connexion |
| GET | /logout | Déconnexion |

## 🏗️ Structure

```
src/
├── app.js                 # Point d'entrée
├── config/swagger.js      # Configuration Swagger
├── controllers/           # Logique métier
├── middleware/            # Auth middleware
├── models/                # Schémas Mongoose
├── routes/                # Définition des routes
├── scripts/importData.js  # Import données
└── views/                 # Templates EJS
```

## 📊 Données initiales

Après `npm run import-data` :
- 24 catways
- 9 réservations
- 1 utilisateur admin

## 👤 Connexion

| Champ | Valeur |
|-------|--------|
| Email | admin@port-russell.fr |
| Mot de passe | admin123 |

## ⚙️ Variables d'environnement

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/port-russell
JWT_SECRET=votre_secret_jwt
SESSION_SECRET=votre_secret_session
```

## 📝 Licence

ISC
