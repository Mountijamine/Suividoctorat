# Module Soutenance - Guide de Démarrage Rapide

## Ce qui a été créé

### Backend (soutenance-service)

#### Modèles de données
- **DemandeSoutenance** : Demande de soutenance avec toutes les informations
- **Prerequis** : Prérequis (publications, crédits, documents)
- **MembreJury** : Membres du jury (rapporteurs, examinateurs, président)
- **DocumentSoutenance** : Documents uploadés
- **StatutDemande** : Enum pour les états de la demande
- **RoleJury** : Enum pour les rôles du jury

#### Repositories
- DemandeRepository
- PrerequisRepository
- MembreJuryRepository
- DocumentSoutenanceRepository

#### Services
- **SoutenanceService** : Logique métier complète

#### Controllers
- **SoutenanceController** : API REST complète avec tous les endpoints

### Frontend (Angular)

#### Composant
- **SoutenancePage** : Page complète avec 3 vues
  - Vue liste : Affiche toutes les demandes
  - Vue création : Formulaire de nouvelle demande
  - Vue détail : Affichage complet avec prérequis et jury

#### Fichiers
- `soutenance.ts` : Composant TypeScript
- `soutenance.html` : Template HTML
- `soutenance.css` : Styles CSS
- `index.ts` : Export du composant

#### Routes
- Ajouté `/soutenance` dans `app.routes.ts`

## Comment tester

### 1. Démarrer la base de données
Assurez-vous que MySQL/XAMPP est démarré avec la base `suividoctorat`

### 2. Démarrer le service soutenance

```powershell
cd d:\Suividoctorat\suividoctorat
.\mvnw.cmd -pl soutenance-service spring-boot:run
```

Le service sera disponible sur `http://localhost:8093`

### 3. Tester l'API

#### Health check
```powershell
curl http://localhost:8093/api/soutenance/health
```

#### Créer une demande
```powershell
curl -X POST http://localhost:8093/api/soutenance/demandes `
  -H "Content-Type: application/json" `
  -d '{
    "doctorantEmail": "doctorant@test.com",
    "directeurEmail": "directeur@test.com",
    "titreThese": "Test Thèse",
    "resume": "Résumé de la thèse"
  }'
```

#### Lister les demandes
```powershell
curl http://localhost:8093/api/soutenance/demandes
```

### 4. Tester dans le frontend

1. Démarrer le frontend (si pas déjà fait) :
```powershell
cd d:\Suividoctorat\suividoctorat\frontend-app
npm start
```

2. Naviguer vers `http://localhost:4200/soutenance`

3. Se connecter avec un utilisateur doctorant, encadrant ou admin

## Fonctionnalités par rôle

### Doctorant
- ✅ Créer une nouvelle demande
- ✅ Remplir les prérequis (publications, crédits)
- ✅ Voir la checklist des documents
- ✅ Soumettre la demande
- ✅ Voir uniquement ses demandes

### Directeur de Thèse (Encadrant)
- ✅ Voir les demandes dont il est directeur
- ✅ Ajouter des membres au jury
- ✅ Spécifier les rôles (rapporteur, examinateur, président)
- ✅ Soumettre la composition du jury

### Administration
- ✅ Voir toutes les demandes
- ✅ Valider ou refuser les prérequis
- ✅ Vérifier la checklist des documents
- ✅ Autoriser la soutenance
- ✅ Planifier date et lieu
- ✅ Rejeter une demande

## Points clés

### Statuts de la demande
La demande suit un workflow avec 12 états différents, de `BROUILLON` à `TERMINEE`.

### Prérequis automatiques
- Publications : minimum 2 requis
- Crédits : minimum 30 requis
- 6 documents obligatoires à fournir

### Validation multi-niveaux
1. Doctorant soumet
2. Admin valide prérequis
3. Directeur propose jury
4. Admin vérifie rapports et autorise

## Structure des fichiers créés

```
soutenance-service/
├── src/main/java/com/devbuild/soutenance/
│   ├── model/
│   │   ├── DemandeSoutenance.java
│   │   ├── Prerequis.java
│   │   ├── MembreJury.java
│   │   ├── DocumentSoutenance.java
│   │   ├── StatutDemande.java
│   │   └── RoleJury.java
│   ├── repository/
│   │   ├── DemandeRepository.java
│   │   ├── PrerequisRepository.java
│   │   ├── MembreJuryRepository.java
│   │   └── DocumentSoutenanceRepository.java
│   ├── service/
│   │   └── SoutenanceService.java
│   ├── controller/
│   │   └── SoutenanceController.java
│   └── SoutenanceApplication.java
├── src/main/resources/
│   └── application.properties (mis à jour)
├── pom.xml (mis à jour)
└── README.md (nouveau)

frontend-app/src/app/pages/soutenance/
├── soutenance.ts
├── soutenance.html
├── soutenance.css
└── index.ts

frontend-app/src/app/
└── app.routes.ts (mis à jour)
```

## Prochaines étapes suggérées

1. **Upload de documents** : Implémenter l'interface d'upload dans le frontend
2. **Notifications** : Ajouter des notifications email aux acteurs
3. **Interface rapporteurs** : Permettre aux rapporteurs de soumettre leurs rapports
4. **Génération PDF** : Générer automatiquement les documents officiels
5. **Statistiques** : Ajouter un dashboard avec stats des soutenances

## Support

Pour toute question ou problème :
- Vérifier les logs du service : console où vous avez lancé le service
- Vérifier la console navigateur pour les erreurs frontend
- Vérifier que la base de données est accessible
- Vérifier que tous les services nécessaires sont démarrés

## Note importante

⚠️ Ce module est **indépendant** et ne touche **aucun autre service** du projet. Il utilise uniquement :
- Sa propre base de données (tables séparées)
- Son propre port (8093)
- Ses propres endpoints
- Sa propre page frontend

Vous pouvez le développer et le tester sans affecter les autres modules !
