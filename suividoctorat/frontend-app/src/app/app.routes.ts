import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { StartPage } from './pages/start-page/start-page';
import { AuthPage } from './pages/auth/auth';
import { DashboardPage } from './pages/dashboard/dashboard';
import { AdminDashboard } from './pages/admin/admin-dashboard';

export const routes: Routes = [
  { path: '', component: StartPage },
  { path: 'auth', component: AuthPage },
  { path: 'dashboard', component: DashboardPage },
  { path: 'admin', component: AdminDashboard },
  { path: '**', redirectTo: '' }
];

export const APP_ROUTER_PROVIDERS = [provideRouter(routes)];
