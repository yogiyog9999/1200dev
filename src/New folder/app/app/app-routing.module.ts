import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { 
    path: 'login', 
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule) 
  },
  { 
    path: 'register', 
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule) 
  },
  { 
    path: 'profile', 
    loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule)
  },
  { 
    path: 'dashboard', 
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule) 
  },
  { 
    path: 'homeowners', 
    loadChildren: () => import('./pages/homeowners/homeowners.module').then(m => m.HomeownersPageModule) 
  },
  { 
    path: 'review/new', 
    loadChildren: () => import('./pages/review-new/review-new.module').then(m => m.ReviewNewPageModule) 
  },
  { 
    path: 'admin/flagged', 
    loadChildren: () => import('./pages/admin-flagged/admin-flagged.module').then(m => m.AdminFlaggedPageModule) 
  },
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
