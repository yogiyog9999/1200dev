import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss']
})
export class ResetPasswordPage {
  step: 'request' | 'update' = 'request';
  email = '';
  newPassword = '';
  info = '';
  errorMsg = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async sendReset() {
    this.loading = true; this.info = ''; this.errorMsg = '';
    try {
      await this.auth.resetPasswordEmail(this.email);
      this.info = 'Reset email sent. Check your inbox.';
    } catch (e: any) {
      this.errorMsg = e.message || 'Failed to send reset email';
    } finally { this.loading = false; }
  }

  async updatePassword() {
    this.loading = true; this.info = ''; this.errorMsg = '';
    try {
      await this.auth.updatePassword(this.newPassword);
      this.info = 'Password updated. You can now log in.';
      setTimeout(() => this.router.navigateByUrl('/login'), 1200);
    } catch (e: any) {
      this.errorMsg = e.message || 'Failed to update password';
    } finally { this.loading = false; }
  }
}
