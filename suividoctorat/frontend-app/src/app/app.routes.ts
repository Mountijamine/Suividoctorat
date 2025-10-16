import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { StartPage } from './pages/start-page/start-page';
import { AuthPage } from './pages/auth/auth';

export const routes: Routes = [
  { path: '', component: StartPage },
  { path: 'auth', component: AuthPage },
  { path: '**', redirectTo: '' }
];

export const APP_ROUTER_PROVIDERS = [provideRouter(routes)];
