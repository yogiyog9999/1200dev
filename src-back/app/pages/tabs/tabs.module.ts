import { NgModule,CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
      },
      {
        path: 'homeowners',
        loadChildren: () =>
          import('../homeowners/homeowners.module').then((m) => m.HomeownersPageModule),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('../profile/profile.module').then((m) => m.ProfileModule),
      },
      {
        path: 'review/new',
        loadChildren: () =>
          import('../review-new/review-new.module').then((m) => m.ReviewNewPageModule),
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
      },
      {
        path: 'review-details/:homeownerName',
        loadChildren: () =>
          import('../review-details/review-details.module').then((m) => m.ReviewDetailsPageModule),
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
