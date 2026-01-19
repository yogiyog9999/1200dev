import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { HomeownersPage } from './homeowners.page';
import { SharedModule } from '../../shared/shared.module'; 
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
	SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomeownersPage
      }
    ])
  ],
  declarations: [HomeownersPage]
})
export class HomeownersPageModule {}
