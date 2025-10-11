# Module d'Inscription - Service d'Inscription

Ce module gère le processus d'inscription et de réinscription des doctorants.

## Fonctionnalités

- Gestion des campagnes d'inscription (dates d'ouverture/fermeture)
- Soumission de dossiers d'inscription avec pièces justificatives
- Circuit de validation : candidat → directeur → administration
- Processus de réinscription simplifié
- Tableau de bord pour le suivi des dossiers
- Notifications automatiques

## Architecture

- **Models** : Doctorant, DossierInscription, CampagneInscription, PieceJointe
- **Services** : InscriptionService, NotificationService, FileStorageService
- **Controllers** : InscriptionController, AdminCampagneController
- **Security** : Authentification par token avec rôles (DOCTORANT, DIRECTEUR, ADMIN)

## API Endpoints

### Authentication
Tous les endpoints nécessitent un header `Authorization: Bearer <token>`.
Le token doit être au format : `dummy-token-for:<username>` (compatible avec gestion-auth-service).

Les rôles sont déterminés par le nom d'utilisateur :
- `admin*` → ADMIN
- `directeur*` ou `director*` → DIRECTEUR  
- Autres → DOCTORANT

### Endpoints Doctorant

#### Soumettre un dossier
```http
POST /api/inscriptions/doctorant/{id}/soumettre
Authorization: Bearer dummy-token-for:doctorant1
Content-Type: application/json

{
  "sujetThese": "Intelligence Artificielle et Machine Learning",
  "directeurThese": "Prof. Dupont",
  "coDirecteur": "Dr. Martin",
  "laboratoire": "LRI"
}
```

#### Réinscription (copie du dossier précédent)
```http
POST /api/inscriptions/doctorant/{id}/reinscription
Authorization: Bearer dummy-token-for:doctorant1
```

#### Téléverser une pièce jointe
```http
POST /api/inscriptions/dossier/{dossierId}/upload
Authorization: Bearer dummy-token-for:doctorant1
Content-Type: multipart/form-data

file: [PDF, JPG, PNG, max 10MB]
```

#### Tableau de bord
```http
GET /api/inscriptions/doctorant/{id}/dashboard
Authorization: Bearer dummy-token-for:doctorant1
```

### Endpoints Directeur de thèse

#### Donner un avis sur un dossier
```http
POST /api/inscriptions/dossier/{dossierId}/directeur/avis
Authorization: Bearer dummy-token-for:directeur1
Content-Type: application/x-www-form-urlencoded

avis=Favorable
```

### Endpoints Administration

#### Valider/Rejeter un dossier
```http
POST /api/inscriptions/dossier/{dossierId}/admin/valider
Authorization: Bearer dummy-token-for:admin1
Content-Type: application/x-www-form-urlencoded

valide=true&note=Dossier complet et conforme
```

#### Créer une campagne
```http
POST /api/admin/campagnes
Authorization: Bearer dummy-token-for:admin1
Content-Type: application/json

{
  "nom": "Campagne Inscription 2025",
  "dateOuverture": "2025-01-15",
  "dateFermeture": "2025-03-15",
  "active": true
}
```

#### Lister les campagnes
```http
GET /api/admin/campagnes
Authorization: Bearer dummy-token-for:admin1
```

#### Activer/Désactiver une campagne
```http
POST /api/admin/campagnes/{id}/toggle
Authorization: Bearer dummy-token-for:admin1
```

## Circuit de validation

1. **Soumission** : Le doctorant soumet son dossier
   - Statut : `SOUMIS`
   - Notification envoyée au directeur de thèse

2. **Avis directeur** : Le directeur donne son avis
   - Statut : `EN_ATTENTE`
   - Notification envoyée à l'administration

3. **Validation administrative** : L'admin valide ou rejette
   - Statut : `VALIDÉ` ou `REJETÉ`
   - Notification envoyée au doctorant

## Configuration

### Ports par défaut
- inscription-service : 8080
- notification-service : 8094

### Properties
```properties
# inscription-service/src/main/resources/application.properties
notification.service.url=http://localhost:8094
```

## Lancement

### Services requis
1. notification-service (port 8094)
2. gestion-auth-service (pour l'authentification)

### Commandes
```bash
# Build
cd inscription-service
../mvnw clean package

# Run
../mvnw spring-boot:run

# Tests
../mvnw test
```

## Stockage des fichiers

Les pièces jointes sont stockées localement dans `inscription-service-uploads/`.
Formats acceptés : PDF, JPG, PNG (max 10MB).

## Base de données

H2 en mémoire par défaut (développement).
Console H2 : http://localhost:8080/h2-console

## Gestion d'erreurs

- `400 Bad Request` : Paramètres manquants/invalides
- `401 Unauthorized` : Token manquant/invalide
- `403 Forbidden` : Permissions insuffisantes
- `409 Conflict` : Campagne fermée, contraintes métier
- `500 Internal Server Error` : Erreur serveur

## Exemples de test avec curl

```bash
# Login (gestion-auth-service)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "doctorant1"}'

# Soumettre un dossier
curl -X POST http://localhost:8080/api/inscriptions/doctorant/1/soumettre \
  -H "Authorization: Bearer dummy-token-for:doctorant1" \
  -H "Content-Type: application/json" \
  -d '{"sujetThese": "IA", "directeurThese": "Prof. X"}'

# Upload fichier
curl -X POST http://localhost:8080/api/inscriptions/dossier/1/upload \
  -H "Authorization: Bearer dummy-token-for:doctorant1" \
  -F "file=@cv.pdf"
```