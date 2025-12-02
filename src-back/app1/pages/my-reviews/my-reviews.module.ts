import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { MyReviewsPage } from './my-reviews.page';
const routes:Routes=[{path:'',component:MyReviewsPage}];
@NgModule({imports:[CommonModule,FormsModule,ReactiveFormsModule,IonicModule,RouterModule.forChild(routes)],declarations:[MyReviewsPage]})
export class MyReviewsPageModule{}