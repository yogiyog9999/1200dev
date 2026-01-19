import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage {
  business_name = ''; 
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  async register() {
  this.loading = true;
  this.error = '';

  try {
    const profile = {
      business_name: this.business_name,
      created_at: new Date().toISOString(),
    };

    const { user } = await this.auth.signUpContractor(this.email, this.password, profile);

    if (user) {
      alert('Registered! Please verify your email before logging in.');
      this.router.navigate(['/profile'], { queryParams: { userId: user.id } });
    }
  } catch (e: any) {
    this.error = e.message || 'Registration failed';
  } finally {
    this.loading = false;
  }
}




}
