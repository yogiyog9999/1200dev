import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { ReviewDetailPage } from './review-detail.page';
const routes:Routes=[
{path:'',component:ReviewDetailPage}
];
@NgModule(
{ 
imports:
[CommonModule,FormsModule,ReactiveFormsModule,IonicModule,RouterModule.forChild(routes)],declarations:[ReviewDetailPage]})
export class ReviewDetailPageModule{}