import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: false,
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
  try {
    const { user } = await this.auth.signIn(this.email, this.password);

    const profile = await this.auth.getProfile(user.id);

    this.router.navigate(['/profile'], { queryParams: { userId: user.id } });
  } catch (e: any) {
    this.error = e.message || 'Login failed';
  }
}

}
