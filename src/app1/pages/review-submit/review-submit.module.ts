import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

import { ReviewSubmitPage } from './review-submit.page';

const routes: Routes = [
  { path: '', component: ReviewSubmitPage }
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    
  ],
  declarations: [ReviewSubmitPage] 
})
export class ReviewSubmitPageModule {}
