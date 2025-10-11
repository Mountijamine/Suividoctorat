# 🚀 Quick Start Guide - Module Soutenance

## Installation Rapide (5 minutes)

### Étape 1: Base de Données (1 min)
```bash
# Démarrer PostgreSQL
# Windows: Services → PostgreSQL
# Linux: sudo systemctl start postgresql

# Créer la base
psql -U postgres -c "CREATE DATABASE soutenance_db;"

# Charger le schéma
psql -U postgres -d soutenance_db -f soutenance-service/db/create_schema.sql
```

### Étape 2: Backend (2 min)
```bash
cd soutenance-service

# Vérifier les configurations dans application.properties:
# - spring.datasource.url
# - spring.datasource.username
# - spring.datasource.password

# Lancer
mvn spring-boot:run
```

✅ **Backend prêt**: http://localhost:8093  
✅ **Swagger**: http://localhost:8093/swagger-ui.html

### Étape 3: Frontend (2 min)
```bash
cd soutenance-frontend

# Si première fois:
npm install

# Lancer
ng serve
```

✅ **Frontend prêt**: http://localhost:4200

---

## Test Rapide

### 1. Tester l'API avec Swagger
1. Ouvrir http://localhost:8093/swagger-ui.html
2. Essayer `GET /api/soutenances/health` → Devrait retourner "Soutenance API is running"
3. Essayer `GET /api/soutenances/statut/SOUMISE` → Liste les soutenances de test

### 2. Tester l'Interface
1. Ouvrir http://localhost:4200/soutenance/dashboard
2. Voir les 3 soutenances de test
3. Cliquer sur "Nouvelle Demande"
4. Remplir le formulaire et tester la validation

---

## Données de Test Pré-chargées

**Soutenance 1** (ID: 1)
- Statut: SOUMISE
- Doctorant: Mohammed ALAMI
- Titre: "Apprentissage profond pour la détection d'anomalies dans les réseaux IoT"

**Soutenance 2** (ID: 2)
- Statut: VALIDEE (avec jury)
- Doctorant: Fatima TAZI
- Titre: "Méthodes de détection d'intrusions basées sur l'apprentissage automatique"

**Soutenance 3** (ID: 3)
- Statut: AUTORISEE (complète avec planning)
- Doctorant: Youssef BENNANI
- Titre: "Applications de la blockchain dans la sécurisation des données médicales"
- Date: 22/05/2025 à 10h00

---

## Configuration Email (Optionnel)

Pour tester les notifications:

```properties
# Dans application.properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=votre-email@gmail.com
spring.mail.password=votre-mot-de-passe-app
```

💡 **Astuce**: Pour Gmail, générer un "mot de passe d'application" dans les paramètres de sécurité.

---

## Problèmes Courants

**❌ Erreur: "Connection refused" (Backend)**
```bash
# Vérifier que PostgreSQL est démarré
# Windows: Services → PostgreSQL
# Linux: sudo systemctl status postgresql
```

**❌ Erreur: "Cannot find module" (Frontend)**
```bash
cd soutenance-frontend
rm -rf node_modules package-lock.json
npm install
```

**❌ Port 8093 déjà utilisé**
```properties
# Changer le port dans application.properties
server.port=8094
```

---

## Prochaines Étapes

1. ✅ Explorer l'API Swagger
2. ✅ Tester le formulaire de demande
3. ✅ Vérifier le dashboard
4. ✅ Lire README_SOUTENANCE.md pour la documentation complète
5. ✅ Consulter DIAGRAMS_UML_SOUTENANCE.md pour l'architecture

---

**Module prêt à l'emploi! Bonne utilisation! 🎓**
