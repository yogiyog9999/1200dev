import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
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
    loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule),
	canActivate: [AuthGuard]
  },
  {
  path: 'help',
  loadChildren: () => import('./pages/help/help.module').then(m => m.HelpPageModule)
},
  {
    path: 'dashboard',
      loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule),
	   canActivate: [AuthGuard]

  },
  {
    path: 'myreview',
      loadChildren: () => import('./pages/my-review/myreview.module').then(m => m.MyreviewPageModule),
	  canActivate: [AuthGuard]

  },
  { 
   path: 'review-edit/:id',
     loadChildren: () => import('./pages/edit-review/editreview.module').then(m => m.EditreviewPageModule),
	 canActivate: [AuthGuard]
	 },

  { 
    path: 'homeowners', 
    loadChildren: () => import('./pages/homeowners/homeowners.module').then(m => m.HomeownersPageModule),
	canActivate: [AuthGuard]
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
    loadChildren: () => import('./pages/review-new/review-new.module').then(m => m.ReviewNewPageModule),
	canActivate: [AuthGuard]
  },
  {
    path: 'review-details/:homeownerName',   // <-- dynamic param
    loadChildren: () => import('./pages/review-details/review-details.module').then(m => m.ReviewDetailsPageModule),
	canActivate: [AuthGuard]
  },
  { 
    path: 'admin/flagged', 
    loadChildren: () => import('./pages/admin-flagged/admin-flagged.module').then(m => m.AdminFlaggedPageModule) 
  },
 
 { 
  path: 'reset-password', 
  loadChildren: () => import('./pages/reset-password/reset-password.module').then(m => m.ResetPasswordPageModule) 
},
{
    path: 'admin',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./pages/admin/admin-dashboard/admin-dashboard.module').then(
            m => m.AdminDashboardPageModule
          )
      },
      {
        path: 'manage-users',
        loadChildren: () =>
          import('./pages/admin/manage-users/manage-users.module').then(
            m => m.ManageUsersPageModule
          )
      },
      {
        path: 'manage-reviews',
        loadChildren: () =>
          import('./pages/admin/manage-reviews/manage-reviews.module').then(
            m => m.ManageReviewsPageModule
          )
      }
    ]
  },
{
  path: 'admin/add-user',
  loadChildren: () => import('./pages/admin/add-users/add-user.module').then(m => m.AddUserPageModule)
}



  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
