import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { StartPage } from './pages/start-page/start-page';
import { AuthPage } from './pages/auth/auth';
import { DashboardPage, DocumentsPage, AddDocumentPage, ProfilePage, SoutenancesPage, CampaignsPage } from './pages/candidat';
import { AdminDashboard } from './pages/admin/admin-dashboard';
import { ProfileSelectionPage } from './pages/profile-selection/profile-selection';
import { SoutenancePage } from './pages/soutenance';
import { SoutenancePremiumPage } from './pages/soutenance/soutenance-premium';
import { EncadrantDashboardPage } from './pages/encadrant';
import { EncadrantDashboardPremiumPage } from './pages/encadrant/encadrant-dashboard-premium';

export const routes: Routes = [
  { path: '', component: StartPage },
  { path: 'auth', component: AuthPage },
  { path: 'reset-password', loadComponent: () => import('./pages/auth/reset-password').then(m => m.ResetPasswordPage) },
  { path: 'confirm', loadComponent: () => import('./pages/confirm/confirm').then(m => m.ConfirmEmailPage) },
  { path: 'profile-selection', component: ProfileSelectionPage },
  { path: 'admin', component: AdminDashboard },
  { path: 'soutenance', component: SoutenancePremiumPage },
  
  // Candidat-specific routes
  { path: 'candidat/dashboard', component: DashboardPage },
  { path: 'candidat/documents', component: DocumentsPage },
  { path: 'candidat/documents/add', component: AddDocumentPage },
  { path: 'candidat/profile', component: ProfilePage },
  { path: 'candidat/soutenances', component: SoutenancesPage },
  { path: 'candidat/campaigns', component: CampaignsPage },
  
  // Encadrant-specific routes
  { path: 'encadrant/dashboard', component: EncadrantDashboardPremiumPage },
  
  // Legacy redirects for backward compatibility
  { path: 'dashboard', redirectTo: 'candidat/dashboard', pathMatch: 'full' },
  { path: 'documents', redirectTo: 'candidat/documents', pathMatch: 'full' },
  { path: 'documents/add', redirectTo: 'candidat/documents/add', pathMatch: 'full' },
  { path: 'profile', redirectTo: 'candidat/profile', pathMatch: 'full' },
  
  { path: '**', redirectTo: '' }
];

export const APP_ROUTER_PROVIDERS = [provideRouter(routes)];
