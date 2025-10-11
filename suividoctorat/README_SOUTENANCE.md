# 🎓 Module de Soutenance - Portail de Suivi du Doctorat

## 📋 Vue d'ensemble

Le **Module de Soutenance** gère le processus complet de soutenance de thèse, de la soumission de la demande à l'autorisation finale et la planification de la défense.

---

## 🏗️ Architecture

### Backend (Spring Boot Microservice)
```
soutenance-service/
├── src/main/java/com/devbuild/soutenance/
│   ├── controller/      # REST Controllers
│   ├── dto/            # Data Transfer Objects
│   ├── model/          # JPA Entities
│   ├── repository/     # JPA Repositories
│   ├── service/        # Business Logic
│   ├── security/       # Security Configuration
│   └── init/           # Data Initialization
├── src/main/resources/
│   ├── application.properties
│   └── application-dev.properties
├── db/
│   └── create_schema.sql
└── pom.xml
```

### Frontend (Angular 18)
```
soutenance-frontend/src/app/soutenance/
├── components/
│   ├── demande-soutenance-form/
│   ├── soutenance-dashboard/
│   ├── soutenance-checklist/
│   └── admin-soutenance-panel/
├── models/
│   ├── soutenance.model.ts
│   ├── document.model.ts
│   ├── jury.model.ts
│   └── prerequis.model.ts
├── services/
│   └── soutenance.service.ts
├── soutenance.module.ts
└── soutenance-routing.module.ts
```

---

## 🚀 Installation et Configuration

### Prérequis
- **Java 17+**
- **Node.js 18+**
- **PostgreSQL 14+**
- **Maven 3.8+**
- **Angular CLI 18+**

### 1. Configuration de la Base de Données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE soutenance_db;

# Exécuter le script de création
\i soutenance-service/db/create_schema.sql
```

### 2. Configuration du Backend

```bash
cd soutenance-service

# Mettre à jour application.properties avec vos informations
# - URL de la base de données
# - Identifiants PostgreSQL
# - Configuration SMTP pour les emails

# Construire le projet
mvn clean install

# Lancer l'application
mvn spring-boot:run
```

Le service sera disponible sur: `http://localhost:8093`

**Swagger UI**: `http://localhost:8093/swagger-ui.html`

### 3. Configuration du Frontend

```bash
cd soutenance-frontend

# Installer les dépendances
npm install

# Configurer l'URL de l'API dans src/environments/environment.ts
# apiUrl: 'http://localhost:8093/api'

# Lancer l'application
ng serve
```

L'application sera disponible sur: `http://localhost:4200`

---

## 📊 Modèle de Données

### Entités Principales

#### 1. **Soutenance**
- `id`: Identifiant unique
- `sujet`: Sujet de recherche
- `titreThese`: Titre de la thèse
- `dateSouhaitee`: Date souhaitée de soutenance
- `dateDefense`: Date planifiée de soutenance
- `statut`: SOUMISE | VALIDEE | REJETEE | AUTORISEE | PLANIFIEE | TERMINEE
- `doctorantId`, `directeurId`, `adminId`: Références utilisateurs
- Relations: `documents`, `jury`, `prerequis`

#### 2. **Document**
- `type`: Type de document (6 types requis)
- `nomFichier`, `cheminFichier`: Informations du fichier
- `valide`: Statut de validation

#### 3. **Jury**
- `presidentNom`, `presidentEmail`, `presidentInstitution`
- Relations: `rapporteurs[]`, `examinateurs[]`

#### 4. **Prerequis**
- `nombreArticlesQ1Q2`: Minimum 2 requis
- `nombreConferences`: Minimum 2 requis
- `heuresFormation`: Minimum 200h requis
- Validation automatique

---

## 🔌 API Endpoints

### Gestion des Soutenances

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/soutenances` | Créer une demande |
| GET | `/api/soutenances/{id}` | Récupérer une soutenance |
| GET | `/api/soutenances/doctorant/{id}` | Liste par doctorant |
| GET | `/api/soutenances/directeur/{id}` | Liste par directeur |
| GET | `/api/soutenances/statut/{statut}` | Liste par statut |
| POST | `/api/soutenances/{id}/documents` | Upload document |
| PUT | `/api/soutenances/{id}/valider` | Validation directeur |
| PUT | `/api/soutenances/{id}/autoriser` | Autorisation admin |
| DELETE | `/api/soutenances/{id}` | Supprimer (si non validée) |

### Exemple de Requête - Créer une Soutenance

```json
POST /api/soutenances
Content-Type: application/json

{
  "sujet": "Intelligence Artificielle",
  "titreThese": "Deep Learning pour la détection d'anomalies",
  "dateSouhaitee": "2025-06-15",
  "doctorantId": 1001,
  "doctorantNom": "ALAMI",
  "doctorantPrenom": "Mohammed",
  "doctorantEmail": "mohammed.alami@univ.ma",
  "directeurId": 2001,
  "directeurNom": "Dr. BENALI",
  "directeurEmail": "benali@univ.ma",
  "prerequis": {
    "nombreArticlesQ1Q2": 3,
    "nombreConferences": 4,
    "heuresFormation": 250
  }
}
```

---

## 🔐 Sécurité

### Configuration Actuelle
- CORS activé pour `localhost:4200` et `localhost:3000`
- Session stateless (JWT recommandé pour production)
- **Note**: Actuellement ouvert en développement - **Ajouter authentification en production**

### Recommandations pour Production
1. Intégrer avec le service `gestion-auth-service`
2. Implémenter JWT tokens
3. Ajouter des rôles (DOCTORANT, DIRECTEUR, ADMIN)
4. Sécuriser les endpoints sensibles

---

## 📧 Notifications

Le système envoie automatiquement des emails à chaque étape:

1. **Soumission** → Notification au directeur
2. **Validation directeur** → Notification à l'administration
3. **Autorisation admin** → Notification au doctorant et directeur
4. **Rejet** → Notification au doctorant

### Configuration SMTP (Gmail exemple)

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

---

## 📄 Génération de PDF

Le système génère automatiquement un **PDF d'autorisation de soutenance** contenant:
- Informations du doctorant
- Détails de la thèse
- Date, heure et lieu de la soutenance
- Composition du jury

Le PDF est stocké dans: `uploads/soutenances/{soutenanceId}/autorisation/`

---

## ✅ Validation des Prérequis

Le système valide automatiquement:

| Prérequis | Minimum Requis |
|-----------|----------------|
| Articles Q1/Q2 | 2 |
| Conférences | 2 |
| Heures de formation | 200h |
| Documents | 5 fichiers PDF |

**La soumission n'est possible que si tous les prérequis sont satisfaits.**

---

## 🧪 Tests

### Données de Test

Le système charge automatiquement 3 soutenances d'exemple en mode `dev`:

1. **Soutenance 1** - Statut: SOUMISE
2. **Soutenance 2** - Statut: VALIDEE (avec jury)
3. **Soutenance 3** - Statut: AUTORISEE (complète)

### Exécuter les Tests

```bash
# Backend
cd soutenance-service
mvn test

# Frontend
cd soutenance-frontend
ng test
```

---

## 🎨 Interface Utilisateur

### Pour les Doctorants
- **Dashboard**: Vue d'ensemble des demandes avec tracker de progression
- **Nouvelle Demande**: Formulaire avec validation en temps réel
- **Checklist**: Affichage des prérequis et statut de validation

### Pour les Directeurs
- **Liste des demandes**: Toutes les demandes de leurs doctorants
- **Validation**: Interface pour valider/rejeter avec proposition de jury
- **Commentaires**: Ajout de notes et recommandations

### Pour l'Administration
- **Panel Admin**: Vue globale de toutes les soutenances
- **Validation**: Vérification finale et autorisation
- **Planification**: Attribution de date, heure et salle
- **Génération PDF**: Création automatique de l'autorisation

---

## 🔧 Dépannage

### Problème: Erreur de connexion à la base de données
**Solution**: Vérifier que PostgreSQL est démarré et les identifiants dans `application.properties`

### Problème: Erreur d'upload de fichiers
**Solution**: Vérifier que le dossier `uploads/` a les permissions d'écriture

### Problème: Emails non envoyés
**Solution**: Vérifier la configuration SMTP et activer l'accès "applications moins sécurisées" pour Gmail

### Problème: CORS Error dans Angular
**Solution**: Vérifier que le backend autorise l'origine du frontend dans `SecurityConfig`

---

## 📈 Évolutions Futures

- [ ] Intégration avec système de calendrier institutionnel
- [ ] Notifications SMS en plus des emails
- [ ] Signature électronique des documents
- [ ] Workflow d'approbation multi-niveaux
- [ ] Export des statistiques en Excel/PDF
- [ ] Module de gestion des rapporteurs externes
- [ ] Système de rappels automatiques

---

## 👥 Support

Pour toute question ou problème:
- **Email**: support@devbuild.com
- **Documentation API**: http://localhost:8093/swagger-ui.html

---

## 📝 Licence

© 2025 DevBuild - Tous droits réservés

---

**Développé avec ❤️ pour faciliter le processus de soutenance de thèse**
