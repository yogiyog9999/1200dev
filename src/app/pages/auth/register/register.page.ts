import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';

import { FirebaseAnalyticsService } from '../../../services/firebase-analytics.service';   // <-- ADD THIS

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
  acceptTerms = false;
  loading = false;
  error = '';
  showPassword = false;
  showConfirmPassword = false;

  // Password strength variables
  strengthPercent = 0;
  strengthText = '';
  strengthColor: 'danger' | 'warning' | 'success' | 'medium' = 'medium';
  strengthClass = '';

  uppercaseRegex: RegExp = /[A-Z]/;
  lowercaseRegex: RegExp = /[a-z]/;
  numberRegex: RegExp = /\d/;
  specialCharRegex: RegExp = /[!@#$%^&*(),.?":{}|<>]/;  

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private analytics: FirebaseAnalyticsService   // <-- ADD THIS
  ) {}

  togglePassword(field: 'password' | 'confirm') {
    if (field === 'password') this.showPassword = !this.showPassword;
    else this.showConfirmPassword = !this.showConfirmPassword;
  }

  checkPasswordStrength() {
    const password = this.password || '';
    let score = 0;

    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    this.strengthPercent = (score / 5) * 100;

    if (score <= 2) {
      this.strengthText = 'Weak';
      this.strengthColor = 'danger';
      this.strengthClass = 'strength-weak';
    } else if (score === 3 || score === 4) {
      this.strengthText = 'Medium';
      this.strengthColor = 'warning';
      this.strengthClass = 'strength-medium';
    } else if (score === 5) {
      this.strengthText = 'Strong';
      this.strengthColor = 'success';
      this.strengthClass = 'strength-strong';
    }

    // 🔥 Track password strength check
    this.analytics.log('password_strength_checked', {
      strength: this.strengthText
    });
  }

  async register() {
    this.error = '';

    // 🔥 Registration started
    this.analytics.log('registration_started');

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{12,}$/;

    if (!passwordRegex.test(this.password)) {
      this.error = 'Password must be at least 12 characters long and include uppercase, lowercase, number, and special character.';

      // 🔥 password validation failed
      this.analytics.log('password_requirements_failed');

      return;
    }

    if (this.password !== this.confirmPassword) {

      // 🔥 Password mismatch
      this.analytics.log('password_mismatch');

      this.error = 'Passwords do not match';
      return;
    }
    if (!this.firstName || this.firstName.trim() === "") {
  this.analytics.log('first_name_missing');
  this.error = "First name is required.";
  return;
}

// Last Name Required
if (!this.lastName || this.lastName.trim() === "") {
  this.analytics.log('last_name_missing');
  this.error = "Last name is required.";
  return;
}

// Email Required
if (!this.email || this.email.trim() === "") {
  this.analytics.log('email_missing');
  this.error = "Email is required.";
  return;
}
    if (!this.acceptTerms) {

      // 🔥 Terms not accepted
      this.analytics.log('terms_not_accepted');

      this.error = 'Please accept the terms and conditions.';
      return;
    }

    this.loading = true;
    const loader = await this.loadingCtrl.create({
      message: 'Creating account...',
      spinner: 'crescent'
    });
    await loader.present();

    try {
      const { user } = await this.auth.signUp(
        this.email,
        this.password,
        this.firstName,
        this.lastName
      );
      await loader.dismiss();

      if (user) {

        // 🔥 Account created (main Firebase analytics event)
        this.analytics.log('account_created', {
          method: 'email',
          userId: user.id
        });

        if (!user.identities || user.identities.length === 0) {

          // Email not verified yet
         if (!user.confirmed_at) {

  const alert = await this.alertCtrl.create({
    header: 'Already Registered',
    message: 'This email is already registered. Please login to continue.',
    backdropDismiss: false,
    buttons: []   // no buttons
  });

  await alert.present();

  // Auto-close and redirect
  setTimeout(() => {
    alert.dismiss();
    this.router.navigate(['auth/login']);
  }, 2000); // redirect after 2 seconds

  //throw new Error("Email not verified");
}
 else {
            this.error = 'This email is already registered. Please login instead.';
            this.showAlert('Registration Failed', this.error);
          }
          return;
        }

        await this.showAlert(
          'Verify Your Email',
          'Registration successful! Please check your inbox (and also your Spam or Junk folder) to verify your email before logging in.'
        );

        // 🔥 Initial signup verification email sent
        this.analytics.log('email_verification_sent');

        this.router.navigate(['/auth/login']);
      }
    } catch (e: any) {
      await loader.dismiss();
      this.error = e.message || 'Registration failed';

      // 🔥 registration failed
      this.analytics.log('registration_failed', {
        error: e.message || 'unknown error'
      });

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

  getPasswordHintColor(regex: RegExp): string {
    return regex.test(this.password) ? 'green' : 'red';
  }

  allPasswordHintsPassed(): boolean {
    return (
      this.password.length >= 12 &&
      this.uppercaseRegex.test(this.password) &&
      this.lowercaseRegex.test(this.password) &&
      this.numberRegex.test(this.password) &&
      this.specialCharRegex.test(this.password)
    );
  }
  generatePassword() {
  const chars = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    number: "0123456789",
    special: "!@#$%^&*(),.?\":{}|<>"
  };

  const allChars = chars.upper + chars.lower + chars.number + chars.special;

  let password = "";

  // Ensure all rules are satisfied
  password += chars.upper[Math.floor(Math.random() * chars.upper.length)];
  password += chars.lower[Math.floor(Math.random() * chars.lower.length)];
  password += chars.number[Math.floor(Math.random() * chars.number.length)];
  password += chars.special[Math.floor(Math.random() * chars.special.length)];

  // Generate remaining characters (to reach 12–16 characters)
  const length = 12 + Math.floor(Math.random() * 5); // between 12–16

  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password so required chars aren't in fixed order
  this.password = password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');

  this.confirmPassword = '';
  this.checkPasswordStrength();

  this.showToast("Strong password generated!", "success");
}



}
