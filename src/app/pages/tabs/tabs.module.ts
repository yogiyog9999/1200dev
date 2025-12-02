import { NgModule,CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from '../../guards/auth.guard';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('../dashboard/dashboard.module').then((m) => m.DashboardPageModule),
		  canActivate: [AuthGuard]
      },
      {
        path: 'homeowners',
        loadChildren: () =>
          import('../homeowners/homeowners.module').then((m) => m.HomeownersPageModule),
		  canActivate: [AuthGuard]
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('../profile/profile.module').then((m) => m.ProfileModule),
		  canActivate: [AuthGuard]
      },
      {
        path: 'write',
        loadChildren: () =>
          import('../review-new/review-new.module').then((m) => m.ReviewNewPageModule),
		  canActivate: [AuthGuard]
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('../notifications/notifications.module').then((m) => m.NotificationsPageModule),
      },
	  {
        path: 'myreview',
        loadChildren: () =>
          import('../my-review/myreview.module').then((m) => m.MyreviewPageModule),
		  canActivate: [AuthGuard]
      },
	  {
        path: 'help',
        loadChildren: () =>
          import('../help/help.module').then((m) => m.HelpPageModule),
		  
      },
      {
        path: 'setting',
        loadChildren: () =>
          import('../setting/settings.module').then((m) => m.SettingsPageModule),
      },
	  {
        path: 'thanks',
        loadChildren: () =>
          import('../thanks/thanks.module').then((m) => m.ThanksPageModule),
		  canActivate: [AuthGuard]
      },
      {
        path: 'review-details/:homeownerName',
        loadChildren: () =>
          import('../review-details/review-details.module').then((m) => m.ReviewDetailsPageModule),
		  canActivate: [AuthGuard]
      },
	   { 
       path: 'review-edit/:id',
       loadChildren: () => import('../edit-review/editreview.module').then(m => m.EditreviewPageModule),
	   canActivate: [AuthGuard]
	 },
      {
        path: 'admin/flagged',
        loadChildren: () =>
          import('../admin-flagged/admin-flagged.module').then((m) => m.AdminFlaggedPageModule),
      },
      {
        path: '',
        redirectTo: '/tabs/dashboard',
        pathMatch: 'full',
      },
    ],
  },
];



@NgModule({
  imports: [IonicModule, CommonModule, FormsModule, RouterModule.forChild(routes)],
  declarations: [TabsPage], schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TabsPageModule {}
