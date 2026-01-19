import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-thanks',
  templateUrl: './thanks.page.html',
  styleUrls: ['./thanks.page.scss'],
})
export class ThanksPage implements OnInit {
  hideNameOnReviews = true;
  allowPushNotifications = false;

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    await this.loadPreferences();
  }

  async loadPreferences() {
    const user = await this.authService.currentUser();
    if (!user) return;

    const prefs = await this.authService.getPreferences(user.id);
    if (prefs) {
      this.hideNameOnReviews = prefs.hide_name ?? false;
      this.allowPushNotifications = prefs.allow_push ?? false;
    }
  }

  async updatePreferences() {
    const user = await this.authService.currentUser();
    if (!user) return;

    try {
      await this.authService.updatePreferences(user.id, {
        hide_name: this.hideNameOnReviews,
        allow_push: this.allowPushNotifications,
      });
      console.log('Preferences updated successfully');
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }
}
