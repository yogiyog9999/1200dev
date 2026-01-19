import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { EditreviewPage } from './editreview.page';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module'; 
const routes: Routes = [
  {
    path: '',
    component: EditreviewPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
	SharedModule,
    RouterModule.forChild(routes) // ✅ This makes routing inside module work
  ],
  
  declarations: [EditreviewPage]
})
export class EditreviewPageModule {}
