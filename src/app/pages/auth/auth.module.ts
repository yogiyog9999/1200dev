import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';
import { LogoutPage } from './logout/logout.page';
import { SharedModule } from '../../shared/shared.module'; 
const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'logout', component: LogoutPage },
];

@NgModule({
  declarations: [LoginPage, RegisterPage, LogoutPage],
  imports: [CommonModule, FormsModule, IonicModule,SharedModule, RouterModule.forChild(routes)]
})
export class AuthModule {}
