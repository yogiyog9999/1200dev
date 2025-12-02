import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';

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

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  async login() {
    this.loading = true;
    this.error = '';

    const loader = await this.loadingCtrl.create({
      message: 'Signing in...',
      spinner: 'crescent'
    });
    await loader.present();

    try {
      const { user } = await this.auth.signIn(this.email, this.password);

      // Check profile completeness
      const profile = await this.auth.getProfile(user.id);
      const needsProfile = !profile || !profile.business_name || !profile.trade || !profile.city || !profile.state || !profile.country;

      await loader.dismiss();

      if (needsProfile) {
        this.showToast('Please complete your profile before continuing.', 'warning');
        this.router.navigate(['/tabs/profile'], { queryParams: { userId: user.id } });
      } else {
        this.showToast('Login successful! 🎉', 'success');
        this.router.navigate(['/tabs/dashboard']);
      }
    } catch (e: any) {
      await loader.dismiss();
      this.error = e.message || 'Login failed';
      this.showAlert('Login Failed', this.error);
    } finally {
      this.loading = false;
    }
  }

  gotoRegister() {
    this.router.navigate(['auth/register']);
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
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
  
  async forgotPassword() {
  const alert = await this.alertCtrl.create({
    header: 'Reset Password',
    inputs: [
      {
        name: 'email',
        type: 'email',
        placeholder: 'Enter your email'
      }
    ],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Send Reset Link',
        handler: async (data) => {
          if (!data.email) {
            this.showToast('Please enter your email', 'warning');
            return false; 
          }

          try {
            await this.auth.resetPassword(data.email);
            this.showToast('Password reset link sent! Check your email.', 'success');
            return true; 
          } catch (err: any) {
            this.showToast(err.message || 'Error sending reset link', 'danger');
            return false; 
          }
        }
      }
    ]
  });

  await alert.present();
}

}
