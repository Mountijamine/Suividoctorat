# 📊 Diagrammes UML - Module de Soutenance

## 1. Diagramme de Cas d'Utilisation

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Système de Soutenance                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────┐                                                      │
│   │Doctorant │                                                      │
│   └────┬─────┘                                                      │
│        │                                                            │
│        ├──────> Consulter prérequis                                │
│        │                                                            │
│        ├──────> Créer demande de soutenance                        │
│        │                                                            │
│        ├──────> Upload documents (PDF)                             │
│        │                                                            │
│        ├──────> Consulter statut demande                           │
│        │                                                            │
│        └──────> Télécharger autorisation                           │
│                                                                      │
│   ┌──────────┐                                                      │
│   │Directeur │                                                      │
│   └────┬─────┘                                                      │
│        │                                                            │
│        ├──────> Consulter demandes étudiants                       │
│        │                                                            │
│        ├──────> Valider/Rejeter demande                            │
│        │                 │                                          │
│        │                 └──────> «include» Proposer jury          │
│        │                                                            │
│        └──────> Ajouter commentaires                               │
│                                                                      │
│   ┌────────────────┐                                                │
│   │Administrateur  │                                                │
│   └────────┬───────┘                                                │
│            │                                                         │
│            ├──────> Consulter toutes les demandes                  │
│            │                                                         │
│            ├──────> Vérifier documents & rapports                  │
│            │                                                         │
│            ├──────> Autoriser soutenance                           │
│            │                 │                                       │
│            │                 ├──────> «include» Planifier date     │
│            │                 │                                       │
│            │                 └──────> «include» Générer PDF        │
│            │                                                         │
│            └──────> Envoyer notifications                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Diagramme de Classes

```
┌─────────────────────────────────┐
│        Soutenance               │
├─────────────────────────────────┤
│ - id: Long                      │
│ - sujet: String                 │
│ - titreThese: String            │
│ - dateSouhaitee: LocalDate      │
│ - dateDefense: LocalDate        │
│ - heureDefense: LocalTime       │
│ - salleDefense: String          │
│ - doctorantId: Long             │
│ - directeurId: Long             │
│ - adminId: Long                 │
│ - statut: StatutSoutenance      │
│ - documents: List<Document>     │
│ - jury: Jury                    │
│ - prerequis: Prerequis          │
├─────────────────────────────────┤
│ + canSubmit(): boolean          │
│ + canValidate(): boolean        │
│ + canAuthorize(): boolean       │
│ + isPrerequisValid(): boolean   │
└──────────┬──────────────────────┘
           │ 1
           │ owns
           │ 1..*
┌──────────▼──────────────────────┐
│        Document                 │
├─────────────────────────────────┤
│ - id: Long                      │
│ - type: TypeDocument            │
│ - nomFichier: String            │
│ - cheminFichier: String         │
│ - tailleFichier: Long           │
│ - formatFichier: String         │
│ - valide: Boolean               │
├─────────────────────────────────┤
│ + isPdf(): boolean              │
└─────────────────────────────────┘

           │ 1
           │ has
           │ 1
┌──────────▼──────────────────────┐
│        Prerequis                │
├─────────────────────────────────┤
│ - id: Long                      │
│ - nombreArticlesQ1Q2: Integer   │
│ - nombreConferences: Integer    │
│ - heuresFormation: Integer      │
│ - articlesValide: Boolean       │
│ - conferencesValide: Boolean    │
│ - formationValide: Boolean      │
│ - documentsValide: Boolean      │
├─────────────────────────────────┤
│ + validateAll(): void           │
│ + isValid(): boolean            │
│ + getValidationSummary(): String│
└─────────────────────────────────┘

           │ 1
           │ has
           │ 0..1
┌──────────▼──────────────────────┐
│           Jury                  │
├─────────────────────────────────┤
│ - id: Long                      │
│ - presidentNom: String          │
│ - presidentEmail: String        │
│ - presidentInstitution: String  │
│ - rapporteurs: List<MembreJury> │
│ - examinateurs: List<MembreJury>│
│ - valide: Boolean               │
├─────────────────────────────────┤
│ + isComplete(): boolean         │
│ + addRapporteur(): void         │
│ + addExaminateur(): void        │
└──────────┬──────────────────────┘
           │ 1
           │ composed of
           │ 2..*
┌──────────▼──────────────────────┐
│       MembreJury                │
├─────────────────────────────────┤
│ - id: Long                      │
│ - nom: String                   │
│ - prenom: String                │
│ - email: String                 │
│ - institution: String           │
│ - grade: String                 │
│ - typeRole: RoleJury            │
│ - rapportFavorable: Boolean     │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  «enumeration»                  │
│  StatutSoutenance               │
├─────────────────────────────────┤
│ SOUMISE                         │
│ VALIDEE                         │
│ REJETEE                         │
│ AUTORISEE                       │
│ PLANIFIEE                       │
│ TERMINEE                        │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  «enumeration»                  │
│  TypeDocument                   │
├─────────────────────────────────┤
│ DEMANDE_MANUSCRITE              │
│ RAPPORT_THESE                   │
│ RAPPORT_ANTI_PLAGIAT            │
│ PUBLICATIONS_COMMUNICATIONS     │
│ ATTESTATIONS_FORMATION          │
│ AUTORISATION_SOUTENANCE         │
└─────────────────────────────────┘
```

---

## 3. Diagramme de Séquence - Soumission de Demande

```
Doctorant    Interface    Controller    Service    Repository    DB    NotificationService
   │             │             │            │           │         │            │
   │──fill form──>│            │            │           │         │            │
   │             │             │            │           │         │            │
   │──upload docs>│            │            │           │         │            │
   │             │             │            │           │         │            │
   │──submit─────>│            │            │           │         │            │
   │             │             │            │           │         │            │
   │             │─POST────────>│           │           │         │            │
   │             │ /soutenances │           │           │         │            │
   │             │             │            │           │         │            │
   │             │             │──validate──>│          │         │            │
   │             │             │  prerequis │          │         │            │
   │             │             │            │          │         │            │
   │             │             │            │──create──>│        │            │
   │             │             │            │ soutenance│        │            │
   │             │             │            │          │         │            │
   │             │             │            │          │─save───>│            │
   │             │             │            │          │         │            │
   │             │             │            │          │<─id─────│            │
   │             │             │            │<─entity──┘         │            │
   │             │             │            │                    │            │
   │             │             │            │──notify────────────────────────>│
   │             │             │            │  directeur                     │
   │             │             │            │                                │
   │             │             │            │                                │
   │             │             │<─response──┘                                │
   │             │             │   (DTO)                                     │
   │             │<─201 Created┘                                             │
   │             │                                                            │
   │<─success────┘                                                            │
   │  message                                                                 │
```

---

## 4. Diagramme de Séquence - Validation par Directeur

```
Directeur   Interface   Controller   Service   Repository   NotificationService
   │            │           │           │          │                │
   │─view list──>│          │           │          │                │
   │            │           │           │          │                │
   │            │─GET───────>│          │          │                │
   │            │ /directeur │          │          │                │
   │            │            │          │          │                │
   │            │            │─find─────>│         │                │
   │            │            │           │─query──>│                │
   │            │            │           │         │                │
   │            │            │<─list─────┘         │                │
   │            │<─200 OK────┘                     │                │
   │<─display───┘                                  │                │
   │            │                                   │                │
   │─select─────>│                                  │                │
   │ defense    │                                   │                │
   │            │                                   │                │
   │─propose────>│                                  │                │
   │  jury      │                                   │                │
   │            │                                   │                │
   │─validate───>│                                  │                │
   │            │                                   │                │
   │            │─PUT────────>│                     │                │
   │            │ /valider    │                     │                │
   │            │  +jury      │                     │                │
   │            │            │                      │                │
   │            │            │──validate────────────>│               │
   │            │            │   +createJury        │               │
   │            │            │                      │               │
   │            │            │                      │─update────────>│
   │            │            │                      │  status       │
   │            │            │                      │  =VALIDEE     │
   │            │            │                      │               │
   │            │            │──notify──────────────────────────────>│
   │            │            │   admin                              │
   │            │            │                                      │
   │            │            │<─updated─────────────┘               │
   │            │<─200 OK────┘                                      │
   │<─confirmed─┘                                                   │
```

---

## 5. Diagramme d'État - Cycle de Vie d'une Soutenance

```
┌─────────┐
│ SOUMISE │────────────────┐
└────┬────┘                │
     │                     │
     │ validate            │ reject
     │ (Directeur)         │ (Directeur)
     ▼                     ▼
┌─────────┐           ┌─────────┐
│ VALIDEE │           │ REJETEE │ (État final)
└────┬────┘           └─────────┘
     │
     │ authorize
     │ (Admin)
     ▼
┌───────────┐
│ AUTORISEE │
└─────┬─────┘
      │
      │ schedule
      │ (Admin)
      ▼
┌───────────┐
│ PLANIFIEE │
└─────┬─────┘
      │
      │ complete
      │ (System)
      ▼
┌──────────┐
│ TERMINEE │ (État final)
└──────────┘
```

---

## 6. Diagramme d'Activité - Processus Complet

```
             ┌─────────────────────┐
             │      DÉBUT          │
             └──────────┬──────────┘
                        ▼
             ┌─────────────────────┐
             │ Doctorant vérifie   │
             │    prérequis        │
             └──────────┬──────────┘
                        ▼
             ┌─────────────────────┐
          ◇──┤ Prérequis valides? ├──◇ NON ─────> [Fin]
             └──────────┬──────────┘
                    OUI │
                        ▼
             ┌─────────────────────┐
             │ Remplir formulaire  │
             └──────────┬──────────┘
                        ▼
             ┌─────────────────────┐
             │ Upload documents    │
             │     (5 PDFs)        │
             └──────────┬──────────┘
                        ▼
             ┌─────────────────────┐
             │ Soumettre demande   │
             └──────────┬──────────┘
                        ▼
             ┌─────────────────────┐
             │ Notification →      │
             │   Directeur         │
             └──────────┬──────────┘
                        ▼
             ┌─────────────────────┐
             │ Directeur examine   │
             │    la demande       │
             └──────────┬──────────┘
                        ▼
             ┌─────────────────────┐
          ◇──┤   Approuvée?       ├──◇ NON ───> [Notification]
             └──────────┬──────────┘               │ Rejet
                    OUI │                          │
                        ▼                          ▼
             ┌─────────────────────┐           [Fin]
             │ Proposition du jury │
             └──────────┬──────────┘
                        ▼
             ┌─────────────────────┐
             │ Notification →      │
             │   Administration    │
             └──────────┬──────────┘
                        ▼
             ┌─────────────────────┐
             │ Admin vérifie docs  │
             │   et rapports       │
             └──────────┬──────────┘
                        ▼
             ┌─────────────────────┐
             │ Planification:      │
             │ - Date              │
             │ - Heure             │
             │ - Salle             │
             └──────────┬──────────┘
                        ▼
             ┌─────────────────────┐
             │ Génération PDF      │
             │  d'autorisation     │
             └──────────┬──────────┘
                        ▼
             ┌─────────────────────┐
             │ Notifications →     │
             │ - Doctorant         │
             │ - Directeur         │
             │ - Membres du jury   │
             └──────────┬──────────┘
                        ▼
             ┌─────────────────────┐
             │   Soutenance        │
             │    planifiée        │
             └──────────┬──────────┘
                        ▼
             ┌─────────────────────┐
             │       FIN           │
             └─────────────────────┘
```

---

## 7. Diagramme de Composants - Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                       FRONTEND (Angular 18)                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐     ┌──────────────────┐                 │
│  │   Components     │     │    Services      │                 │
│  ├──────────────────┤     ├──────────────────┤                 │
│  │ - Dashboard      │────▶│ SoutenanceService│                 │
│  │ - Form           │     │ - HTTP Client    │                 │
│  │ - Checklist      │     │ - API Calls      │                 │
│  │ - Admin Panel    │     └────────┬─────────┘                 │
│  └──────────────────┘              │                            │
│                                    │ HTTP/REST                  │
└────────────────────────────────────┼────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────┐
│                    BACKEND (Spring Boot)                        │
├────────────────────────────────────┼────────────────────────────┤
│                                    ▼                            │
│  ┌─────────────────────────────────────────────────┐           │
│  │           REST Controllers                      │           │
│  │  - SoutenanceController                         │           │
│  │  - GlobalExceptionHandler                       │           │
│  └──────────────────┬──────────────────────────────┘           │
│                     │                                           │
│                     ▼                                           │
│  ┌─────────────────────────────────────────────────┐           │
│  │              Service Layer                      │           │
│  │  - SoutenanceService                            │           │
│  │  - DocumentStorageService                       │           │
│  │  - PdfGenerationService                         │           │
│  │  - NotificationService                          │           │
│  │  - SoutenanceMapper                             │           │
│  └──────────────────┬──────────────────────────────┘           │
│                     │                                           │
│                     ▼                                           │
│  ┌─────────────────────────────────────────────────┐           │
│  │          Repository Layer (JPA)                 │           │
│  │  - SoutenanceRepository                         │           │
│  │  - DocumentRepository                           │
│  │  - JuryRepository                               │           │
│  │  - PrerequisRepository                          │           │
│  └──────────────────┬──────────────────────────────┘           │
│                     │                                           │
└─────────────────────┼───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│              PostgreSQL Database                                │
├─────────────────────────────────────────────────────────────────┤
│  - soutenances                                                  │
│  - documents                                                    │
│  - jurys                                                        │
│  - membres_jury                                                 │
│  - prerequis                                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    External Services                            │
├─────────────────────────────────────────────────────────────────┤
│  - SMTP Server (Email Notifications)                           │
│  - File Storage System                                          │
│  - Auth Service (gestion-auth-service)                          │
└─────────────────────────────────────────────────────────────────┘
```

---

**Ces diagrammes UML fournissent une vue complète de l'architecture et du fonctionnement du module de soutenance.**
