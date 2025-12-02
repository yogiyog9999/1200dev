import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  //{ path: '', redirectTo: 'auth/login', pathMatch: 'full' },
   { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
    {
    path: 'tabs',
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule)
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
    path: 'myreview',
      loadChildren: () => import('./pages/my-review/myreview.module').then(m => m.MyreviewPageModule)

  },
  { 
    path: 'homeowners', 
    loadChildren: () => import('./pages/homeowners/homeowners.module').then(m => m.HomeownersPageModule) 
  },
  {
    path: 'notifications',
    loadChildren: () => import('./pages/notifications/notifications.module').then(m => m.NotificationsPageModule)
  },
  { 
    path: 'setting', 
    loadChildren: () => import('./pages/setting/settings.module').then(m => m.SettingsPageModule) 
  },
  { 
    path: 'thanks', 
    loadChildren: () => import('./pages/thanks/thanks.module').then(m => m.ThanksPageModule) 
  },
  { 
    path: 'review/new', 
    loadChildren: () => import('./pages/review-new/review-new.module').then(m => m.ReviewNewPageModule) 
  },
  {
    path: 'review-details/:homeownerName',   // <-- dynamic param
    loadChildren: () => import('./pages/review-details/review-details.module').then(m => m.ReviewDetailsPageModule),
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
