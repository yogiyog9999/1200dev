import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  async register() {
    this.loading = true;
    this.error = '';
    try {
      const { user } = await this.auth.signUp(this.email, this.password);
      if (user) {
        alert('Registered! Please verify your email before logging in.');
        this.router.navigate(['/login']);
      } else {
        this.error = 'Registration succeeded but no user returned.';
      }
    } catch (e: any) {
      this.error = e.message || 'Registration failed';
    } finally {
      this.loading = false;
    }
  }
}
