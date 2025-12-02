import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { ThanksPage } from './thanks.page';
import { SharedModule } from '../../shared/shared.module'; 
const routes: Routes = [
  {
    path: '',
    component: ThanksPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
	SharedModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ThanksPage]
})
export class ThanksPageModule {}
