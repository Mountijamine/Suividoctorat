# Module de Gestion des Soutenances

Ce module gère le processus de soutenance de thèse de doctorat.

## Fonctionnalités

### 1. Demande de Soutenance (Doctorant)
- Création d'une demande de soutenance
- Saisie du titre de thèse et du résumé
- Mise à jour des prérequis (publications, crédits de formation)
- Soumission de la demande

### 2. Vérification des Prérequis (Administration)
- Vérification automatique et manuelle des prérequis :
  - **Publications scientifiques** : Minimum 2 requis
  - **Crédits de formation doctorale** : Minimum 30 requis
  - **Documents obligatoires** :
    - Demande manuscrite adressée au chef d'établissement
    - Rapport de thèse
    - Rapport anti-plagiat
    - Rapport contenant les publications et communications
    - Copies d'attestations de formations
    - Autorisation de soutenance
- Validation ou refus par l'administration

### 3. Proposition du Jury (Directeur de Thèse)
- Ajout des membres du jury avec leurs informations :
  - Rapporteurs
  - Examinateurs
  - Président du jury
- Soumission de la composition du jury

### 4. Autorisation et Planification (Administration)
- Vérification des rapports des rapporteurs
- Autorisation finale de la soutenance
- Planification de la date, heure et lieu

## États de la Demande

```
BROUILLON           → Création initiale
SOUMISE             → Soumise par le doctorant
EN_VERIFICATION     → Administration vérifie les prérequis
PREREQUIS_VALIDES   → Prérequis validés
EN_ATTENTE_JURY     → En attente de la composition du jury
JURY_PROPOSE        → Jury proposé par le directeur
EN_ATTENTE_RAPPORTS → En attente des rapports
RAPPORTS_FAVORABLES → Rapports favorables reçus
AUTORISEE           → Soutenance autorisée
PLANIFIEE           → Date et lieu fixés
TERMINEE            → Soutenance terminée
REJETEE             → Demande rejetée
```

## API Endpoints

### Demandes
- `POST /api/soutenance/demandes` - Créer une demande
- `GET /api/soutenance/demandes` - Liste des demandes (avec filtres par rôle)
- `GET /api/soutenance/demandes/{id}` - Détails d'une demande
- `POST /api/soutenance/demandes/{id}/submit` - Soumettre une demande
- `POST /api/soutenance/demandes/{id}/reject` - Rejeter une demande (admin)
- `POST /api/soutenance/demandes/{id}/authorize` - Autoriser la soutenance (admin)

### Prérequis
- `GET /api/soutenance/demandes/{id}/prerequis` - Obtenir les prérequis
- `PUT /api/soutenance/demandes/{id}/prerequis` - Mettre à jour (doctorant)
- `POST /api/soutenance/demandes/{id}/prerequis/validate` - Valider (admin)
- `POST /api/soutenance/demandes/{id}/prerequis/documents` - Mettre à jour la checklist

### Jury
- `GET /api/soutenance/demandes/{id}/jury` - Liste des membres du jury
- `POST /api/soutenance/demandes/{id}/jury` - Ajouter un membre
- `POST /api/soutenance/demandes/{id}/jury/submit` - Soumettre la composition

### Documents
- `GET /api/soutenance/demandes/{id}/documents` - Liste des documents
- `POST /api/soutenance/demandes/{id}/documents` - Upload un document

## Configuration

### Backend (soutenance-service)

**application.properties** :
```properties
server.port=8093
spring.application.name=soutenance-service

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/suividoctorat?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Upload
spring.servlet.multipart.max-file-size=10MB
app.upload.dir=./uploads/soutenance
```

### Frontend

**URL de l'API** : `http://localhost:8093/api/soutenance`

La page est accessible via `/soutenance` dans l'application Angular.

## Démarrage

### 1. Démarrer le service backend

```bash
cd soutenance-service
../mvnw.cmd spring-boot:run
```

Le service sera accessible sur `http://localhost:8093`

### 2. Démarrer le frontend (si ce n'est pas déjà fait)

```bash
cd frontend-app
npm start
```

Accéder à `http://localhost:4200/soutenance`

## Rôles et Permissions

### Doctorant (ROLE_DOCTORANT)
- Créer une demande de soutenance
- Mettre à jour les prérequis (publications, crédits)
- Voir uniquement ses propres demandes
- Soumettre sa demande

### Directeur de Thèse (ROLE_ENCADRANT)
- Voir les demandes dont il est directeur
- Proposer la composition du jury
- Ajouter des membres au jury

### Administration (ROLE_ADMIN, ROLE_PERSONNEL)
- Voir toutes les demandes
- Valider ou refuser les prérequis
- Autoriser les soutenances
- Planifier les soutenances
- Rejeter les demandes

## Base de Données

Les tables suivantes seront créées automatiquement :

- `demande_soutenance` - Demandes de soutenance
- `prerequis` - Prérequis pour chaque demande
- `membre_jury` - Membres du jury
- `document_soutenance` - Documents uploadés

## Workflow Complet

1. **Doctorant** : Crée une demande avec titre et résumé
2. **Doctorant** : Remplit les prérequis (publications, crédits)
3. **Doctorant** : Upload les documents requis
4. **Doctorant** : Soumet la demande
5. **Administration** : Vérifie les prérequis et documents
6. **Administration** : Valide ou refuse les prérequis
7. **Directeur** : Propose la composition du jury
8. **Directeur** : Soumet la composition du jury
9. **Rapporteurs** : Soumettent leurs rapports (externe au système pour l'instant)
10. **Administration** : Vérifie les rapports favorables
11. **Administration** : Autorise la soutenance
12. **Administration** : Planifie la date, heure et lieu
13. **Soutenance** : A lieu à la date prévue

## Notes Importantes

- Le module est **indépendant** des autres services
- Toutes les opérations sont tracées avec timestamps
- Les documents sont stockés localement (configurer un stockage cloud en production)
- Les emails ne sont pas encore implémentés (à ajouter selon besoin)

## Développement Futur

- [ ] Notifications par email aux différents acteurs
- [ ] Interface pour les rapporteurs pour uploader leurs rapports
- [ ] Génération automatique de documents PDF (autorisation, convocation, etc.)
- [ ] Intégration avec un calendrier pour la planification
- [ ] Export des données en Excel/PDF pour archivage
- [ ] Statistiques et tableaux de bord
