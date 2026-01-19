import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-resend-verify',
  templateUrl: './resend-verify.page.html',
  styleUrls: ['./resend-verify.page.scss']
})
export class ResendVerifyPage {
  email = '';
  info = '';
  errorMsg = '';
  loading = false;

  constructor(private auth: AuthService) {}

  async resend() {
    this.loading = true; this.info = ''; this.errorMsg = '';
    try {
      await this.auth.resendVerification(this.email);
      this.info = 'Verification email sent if the account exists and is unverified.';
    } catch (e: any) {
      this.errorMsg = e.message || 'Failed to resend';
    } finally {
      this.loading = false;
    }
  }
}
