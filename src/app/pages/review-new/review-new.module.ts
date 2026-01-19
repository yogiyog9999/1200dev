import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ReviewNewPage } from './review-new.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: ReviewNewPage
      }
    ])
  ],
  declarations: [ReviewNewPage]
})
export class ReviewNewPageModule {}
