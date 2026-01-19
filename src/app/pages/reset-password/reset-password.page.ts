import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss']
})
export class ResetPasswordPage implements OnInit {
  step: 'request' | 'update' = 'request';
  email = '';
  newPassword = '';
  info = '';
  errorMsg = '';
  loading = false;
showPassword = false;
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    const hash = window.location.hash; // #access_token=...&refresh_token=...
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', ''));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
        this.auth.setSessionFromUrl(access_token, refresh_token)
          .then(() => {
            this.step = 'update';
            history.replaceState(null, '', '/reset-password'); // remove hash
          })
          .catch(err => this.errorMsg = err.message || 'Invalid reset link');
      }
    }
  }

  async sendReset() {
    this.loading = true; this.info = ''; this.errorMsg = '';
    try {
      await this.auth.resetPassword(this.email);
      this.info = 'Reset email sent. Check your inbox.';
    } catch (e: any) {
      this.errorMsg = e.message || 'Failed to send reset email';
    } finally {
      this.loading = false;
    }
  }

  async updatePassword() {
    this.loading = true; this.info = ''; this.errorMsg = '';
    try {
      await this.auth.updatePassword(this.newPassword);
      this.info = 'Password updated. You can now log in.';
      setTimeout(() => this.router.navigateByUrl('/login'), 1200);
    } catch (e: any) {
      this.errorMsg = e.message || 'Failed to update password';
    } finally {
      this.loading = false;
    }
  }
}
