import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async login() {
    this.loading = true;
    this.error = '';
    try {
      const { user } = await this.auth.signIn(this.email, this.password);

      // Check profile completeness
      const profile = await this.auth.getProfile(user.id);
      const needsProfile = !profile || !profile.business_name || !profile.trade || !profile.city || !profile.state || !profile.country;

      if (needsProfile) {
        this.router.navigate(['/profile'], { queryParams: { userId: user.id } });
      } else {
        this.router.navigate(['/dashboard']);
      }
    } catch (e: any) {
      this.error = e.message || 'Login failed';
    } finally {
      this.loading = false;
    }
  }

  gotoRegister() {
    this.router.navigate(['/register']);
  }
}
