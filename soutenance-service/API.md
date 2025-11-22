# Soutenance Service API Documentation

## Overview
This service manages PhD defense requests (soutenance) from initial submission to final authorization and scheduling.

## Workflow

### 1. Defense Request Initiation (Doctorant)
**POST** `/api/soutenance/demandes`
```json
{
  "doctorantEmail": "doctorant@example.com",
  "directeurEmail": "directeur@example.com",
  "titreThese": "Title of thesis",
  "resume": "Thesis summary"
}
```
Status: `BROUILLON` → Creates request in draft state

### 2. Update Draft (Doctorant)
**PUT** `/api/soutenance/demandes/{id}`
```json
{
  "doctorantEmail": "doctorant@example.com",
  "titreThese": "Updated title",
  "resume": "Updated summary"
}
```

### 3. Update Prerequisites (Doctorant)
**PUT** `/api/soutenance/demandes/{id}/prerequis`
```json
{
  "nombrePublications": 3,
  "creditsFormation": 35
}
```

### 4. Upload Documents (Doctorant)
**POST** `/api/soutenance/demandes/{id}/documents`
- Form data with file upload
- Parameters:
  - `file`: MultipartFile
  - `typeDocument`: One of:
    - `DEMANDE_MANUSCRITE`
    - `RAPPORT_THESE`
    - `ANTI_PLAGIAT`
    - `RAPPORT_PUBLICATIONS`
    - `ATTESTATIONS_FORMATION`
    - `AUTORISATION_SOUTENANCE`
  - `description`: Optional description

### 5. Submit Request (Doctorant)
**POST** `/api/soutenance/demandes/{id}/submit`
```json
{
  "doctorantEmail": "doctorant@example.com"
}
```
Status: `BROUILLON` → `SOUMISE`

### 6. Start Verification (Admin)
**POST** `/api/soutenance/demandes/{id}/start-verification`
```json
{
  "adminEmail": "admin@example.com"
}
```
Status: `SOUMISE` → `EN_VERIFICATION`

### 7. Validate Prerequisites (Admin)
**POST** `/api/soutenance/demandes/{id}/prerequis/validate`
```json
{
  "adminEmail": "admin@example.com",
  "valide": true,
  "commentaires": "All prerequisites validated"
}
```
Status: `EN_VERIFICATION` → `PREREQUIS_VALIDES`

Checks:
- ✓ Number of publications ≥ required
- ✓ Formation credits ≥ required
- ✓ All required documents uploaded

### 8. Request Jury Proposal (Admin)
**POST** `/api/soutenance/demandes/{id}/request-jury`
```json
{
  "adminEmail": "admin@example.com"
}
```
Status: `PREREQUIS_VALIDES` → `EN_ATTENTE_JURY`

### 9. Add Jury Members (Directeur de Thèse)
**POST** `/api/soutenance/demandes/{id}/jury`
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@university.fr",
  "etablissement": "Université X",
  "grade": "Professeur",
  "role": "RAPPORTEUR",
  "commentaires": "Expert in the field"
}
```

Roles:
- `RAPPORTEUR` (minimum 2 required)
- `EXAMINATEUR`
- `PRESIDENT`

### 10. Submit Jury Proposal (Directeur)
**POST** `/api/soutenance/demandes/{id}/jury/submit`
```json
{
  "directeurEmail": "directeur@example.com"
}
```
Status: `EN_ATTENTE_JURY` → `JURY_PROPOSE`

### 11. Validate Jury (Admin)
**POST** `/api/soutenance/demandes/{id}/jury/validate`
```json
{
  "adminEmail": "admin@example.com"
}
```
Status: `JURY_PROPOSE` → `EN_ATTENTE_RAPPORTS`

### 12. Submit Rapporteur Report (Rapporteur)
**POST** `/api/soutenance/jury/{membreId}/rapport`
- Form data with optional file upload
- Parameters:
  - `favorable`: Boolean (true/false)
  - `commentaires`: Optional comments
  - `rapport`: Optional PDF file

When all rapporteurs submit favorable reports:
Status: `EN_ATTENTE_RAPPORTS` → `RAPPORTS_FAVORABLES`

### 13. Authorize Defense (Admin)
**POST** `/api/soutenance/demandes/{id}/authorize`
```json
{
  "adminEmail": "admin@example.com",
  "dateSoutenance": "2025-12-15T14:00:00",
  "lieu": "Amphithéâtre A"
}
```
Status: `RAPPORTS_FAVORABLES` → `AUTORISEE`

### 14. Plan Defense (Admin)
**POST** `/api/soutenance/demandes/{id}/plan`

Status: `AUTORISEE` → `PLANIFIEE`

### 15. Complete Defense (Admin)
**POST** `/api/soutenance/demandes/{id}/complete`
```json
{
  "adminEmail": "admin@example.com"
}
```
Status: `PLANIFIEE` → `TERMINEE`

## Query Endpoints

### Get All Requests
**GET** `/api/soutenance/demandes`

Query parameters:
- `role`: `doctorant`, `directeur`, `jury`, or omit for all
- `email`: Filter by user email

### Get Single Request
**GET** `/api/soutenance/demandes/{id}`

### Get Prerequisites
**GET** `/api/soutenance/demandes/{id}/prerequis`

### Get Jury Members
**GET** `/api/soutenance/demandes/{id}/jury`

### Get Documents
**GET** `/api/soutenance/demandes/{id}/documents`

### Get Statistics (Admin)
**GET** `/api/soutenance/statistics`

Returns counts by status:
```json
{
  "total": 100,
  "brouillon": 5,
  "soumises": 10,
  "en_verification": 8,
  "prerequis_valides": 12,
  "en_attente_jury": 7,
  "jury_propose": 6,
  "en_attente_rapports": 9,
  "rapports_favorables": 8,
  "autorisees": 15,
  "planifiees": 10,
  "terminees": 5,
  "rejetees": 5
}
```

## Administrative Actions

### Reject Request
**POST** `/api/soutenance/demandes/{id}/reject`
```json
{
  "adminEmail": "admin@example.com",
  "raison": "Reason for rejection"
}
```
Status: Any → `REJETEE`

### Delete Draft Request (Doctorant)
**DELETE** `/api/soutenance/demandes/{id}?doctorantEmail=email@example.com`

Only drafts can be deleted.

### Delete Jury Member (Directeur)
**DELETE** `/api/soutenance/jury/{membreId}?directeurEmail=email@example.com`

Only before jury validation.

## Status Flow

```
BROUILLON (Draft)
    ↓ [submit]
SOUMISE (Submitted)
    ↓ [start verification]
EN_VERIFICATION (Under verification)
    ↓ [validate prerequisites]
PREREQUIS_VALIDES (Prerequisites validated)
    ↓ [request jury]
EN_ATTENTE_JURY (Waiting for jury proposal)
    ↓ [submit jury]
JURY_PROPOSE (Jury proposed)
    ↓ [validate jury]
EN_ATTENTE_RAPPORTS (Waiting for rapporteur reports)
    ↓ [all favorable reports]
RAPPORTS_FAVORABLES (Favorable reports received)
    ↓ [authorize]
AUTORISEE (Authorized)
    ↓ [plan]
PLANIFIEE (Scheduled)
    ↓ [complete]
TERMINEE (Completed)

[any status] → REJETEE (Rejected)
```

## Prerequisites Checklist

### Publications
- `nombrePublications`: Current count
- `nombrePublicationsRequises`: Required count (default: 2)
- `publicationsValides`: Auto-validated when count ≥ required

### Formation Credits
- `creditsFormation`: Current credits
- `creditsFormationRequis`: Required credits (default: 30)
- `creditsValides`: Auto-validated when credits ≥ required

### Required Documents
- `demandeManuscrite`: Written request to institution head
- `rapportThese`: Thesis report
- `rapportAntiPlagiat`: Anti-plagiarism report
- `rapportPublications`: Publications and communications report
- `attestationsFormation`: Training certificates
- `autorisationSoutenance`: Defense authorization

All must be `true` for prerequisites to be validated.

## Error Responses

All endpoints return error responses in this format:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200 OK`: Successful operation
- `201 Created`: Resource created
- `400 Bad Request`: Invalid request or business rule violation
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## File Upload Configuration

Upload directory: `./uploads/soutenance` (configurable in `application.properties`)

Maximum file size: 10MB (configurable)

Supported document types:
- PDF
- DOCX
- Images (JPG, PNG)
