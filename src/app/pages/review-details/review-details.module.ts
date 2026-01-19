import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ReviewDetailsPage } from './review-details.page';
import { JsonParsePipe } from '../../pipes/json-parse-pipe';
const routes: Routes = [
  {
    path: '',
    component: ReviewDetailsPage  
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,SharedModule,
	JsonParsePipe,
    RouterModule.forChild(routes)  
  ],
  declarations: [ReviewDetailsPage]
})
export class ReviewDetailsPageModule {}
