# Angular Soutenance Module - Frontend Implementation

This directory contains the Angular 18 frontend implementation for the Soutenance module.

## 📁 Structure

```
soutenance-frontend/
├── src/
│   └── app/
│       └── soutenance/
│           ├── models/
│           │   ├── soutenance.model.ts
│           │   ├── document.model.ts
│           │   ├── jury.model.ts
│           │   └── prerequis.model.ts
│           ├── services/
│           │   └── soutenance.service.ts
│           ├── components/
│           │   ├── demande-soutenance-form/
│           │   ├── soutenance-checklist/
│           │   ├── soutenance-dashboard/
│           │   └── admin-soutenance-panel/
│           ├── soutenance-routing.module.ts
│           └── soutenance.module.ts
└── README.md (this file)
```

## 🚀 Setup Instructions

1. **Create a new Angular 18 project:**
```bash
ng new soutenance-frontend --routing --style=scss
cd soutenance-frontend
```

2. **Install Angular Material:**
```bash
ng add @angular/material
```

3. **Install dependencies:**
```bash
npm install
```

4. **Copy the files** from this directory structure into your Angular project.

5. **Update app.routes.ts** to include soutenance routing:
```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'soutenance',
    loadChildren: () => import('./soutenance/soutenance.module').then(m => m.SoutenanceModule)
  }
];
```

6. **Run the application:**
```bash
ng serve
```

The application will be available at `http://localhost:4200`

## 📋 Features

- **Demande de Soutenance Form** - Submit defense requests with prerequisite validation
- **Soutenance Dashboard** - View status and history of defense requests
- **Soutenance Checklist** - Display and track prerequisites
- **Admin Panel** - Validate and authorize defenses, schedule dates

## 🔗 API Configuration

Update the API base URL in `environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8093/api'
};
```
