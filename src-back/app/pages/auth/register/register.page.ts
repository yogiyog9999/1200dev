import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage {
  email = '';
  firstName = '';
  lastName = '';
  password = '';
  confirmPassword = '';
  acceptTerms='';
  loading = false;
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  async register() {
    this.error = '';

    // ✅ confirm password validation
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;

    const loader = await this.loadingCtrl.create({
      message: 'Creating account...',
      spinner: 'crescent'
    });
    await loader.present();
try {
  const { user } = await this.auth.signUp(this.email, this.password, this.firstName, this.lastName);
  await loader.dismiss();

  if (user) {
    if (!user.identities || user.identities.length === 0) {
      // Already registered
      if (!user.email_confirmed_at) {
        // ❌ Registered but not verified → show resend option
		console.log("✅ Verified");
        const alert = await this.alertCtrl.create({
          header: 'Email Not Verified',
          message: 'This email is already registered but not verified. Would you like us to resend the verification link?',
          buttons: [
            { text: 'Cancel', role: 'cancel' },
            {
              text: 'Resend Link',
              handler: async () => {
                try {
                  await this.auth.resendVerificationEmail(this.email);
                  this.showToast('Verification email sent again! 📩', 'success');
                } catch (err: any) {
                  this.showToast(err.message || 'Failed to resend verification email', 'danger');
                }
              }
            }
          ]
        });
        await alert.present();
      } else {
        // ✅ Already registered & verified → block with error
		console.log("✅ notVerified");
        this.error = 'This email is already registered. Please login instead.';
        this.showAlert('Registration Failed', this.error);
      }
      return;
    }

    // ✅ Fresh registration
    await this.showAlert(
      'Verify Your Email',
      'Registration successful! Please check your inbox to verify your email before logging in.'
    );
    this.router.navigate(['/auth/login']);
  }
} 
 catch (e: any) {
      await loader.dismiss();
      this.error = e.message || 'Registration failed';
      this.showAlert('Registration Failed', this.error);
    } finally {
      this.loading = false;
    }
  }

  gotoLogin() {
    this.router.navigate(['auth/login']);
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'top'
    });
    toast.present();
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
