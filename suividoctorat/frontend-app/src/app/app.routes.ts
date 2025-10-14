import { Routes } from '@angular/router';
import { importProvidersFrom } from '@angular/core';

export const routes: Routes = [
	{ path: 'login', loadComponent: () => import('./auth/login.material.component').then(m => m.LoginMaterialComponent) },
	{ path: 'signup', loadComponent: () => import('./auth/signup.material.component').then(m => m.SignupMaterialComponent) },
	{ path: '', redirectTo: '/login', pathMatch: 'full' }
];
