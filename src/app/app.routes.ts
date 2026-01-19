import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage) },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage) },
  { path: 'review/new', loadComponent: () => import('./pages/review-new/review-new.page').then(m => m.ReviewNewPage) },
  { path: 'homeowners', loadComponent: () => import('./pages/homeowners/homeowners.page').then(m => m.HomeownersPage) },
  { path: 'admin/flagged', loadComponent: () => import('./pages/admin-flagged/admin-flagged.page').then(m => m.AdminFlaggedPage) }
];
