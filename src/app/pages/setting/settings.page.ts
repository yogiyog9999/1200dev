import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ToastController, Platform } from '@ionic/angular';
import { PushNotifications, Token, PermissionStatus } from '@capacitor/push-notifications';

@Component({
  standalone: false,
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  hideNameOnReviews = false;
  allowPushNotifications = false;
  isUpdating = false;

  constructor(
    private authService: AuthService,
    private toastCtrl: ToastController,
    private platform: Platform
  ) {}

  async ngOnInit() {
    await this.loadPreferences();
  }

  // 🔥 Runs every time page is opened
  async ionViewWillEnter() {
    await this.autoCheckPushPermission();
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

  // 🔄 Auto-check push permission every time page opens
  async autoCheckPushPermission() {
    if (!this.platform.is('capacitor')) return;

    const status = await PushNotifications.checkPermissions();

    if (status.receive === 'granted') {
      // auto enable toggle
      this.allowPushNotifications = true;
    } else {
      // auto disable toggle
      this.allowPushNotifications = false;
    }
  }

 async updatePreferences() {
  if (this.isUpdating) return;
  this.isUpdating = true;

  const user = await this.authService.currentUser();
  if (!user) {
    await this.showToast('User not logged in', 'danger');
    this.isUpdating = false;
    return;
  }

  console.log("🔧 Updating prefs for user:", user.id);
  console.log("hideName:", this.hideNameOnReviews, "allowPush:", this.allowPushNotifications);

  try {

    if (this.allowPushNotifications) {
      console.log("➡ Enabling Push Notifications...");
      await this.enablePushNotifications(user.id);
    } else {
      console.log("➡ Disabling Push Notifications...");
      await this.disablePushNotifications(user.id);
    }

    console.log("➡ Saving Preferences to Database...");
    await this.authService.updatePreferences(user.id, {
      hide_name: this.hideNameOnReviews,
      allow_push: this.allowPushNotifications,
    });

    await this.showToast('Preferences updated successfully', 'success');
  } catch (error) {
    console.error('❌ ERROR in updatePreferences():', error);
    await this.showToast('Error updating preferences', 'danger');
  } finally {
    this.isUpdating = false;
  }
}


  // ✅ Enable push -> Ask Permission
 async enablePushNotifications(userId: string) {
  console.log("🔔 Requesting Push Notification Permission...");

  const permission = await PushNotifications.requestPermissions();
  console.log("Permission Result:", permission);

  if (permission.receive !== 'granted') {
    console.log("❌ Permission not granted, revert toggle");
    this.allowPushNotifications = false;
    return;
  }

  console.log("📡 Registering for push...");
  PushNotifications.register();

  PushNotifications.addListener('registration', async (token: Token) => {
    console.log("📨 FCM Token Received:", token.value);

    try {
      console.log("➡ Saving token in backend...");
      await this.authService.saveFcmToken(userId, token.value);
    } catch (error) {
      console.log("❌ Error saving token:", error);
    }
  });

  PushNotifications.addListener('registrationError', err => {
    console.log("❌ Registration Error:", err);
  });
}


  // ❌ Disable push -> Remove Token
  async disablePushNotifications(userId: string) {
  console.log("🔕 Removing Push Token...");

  try {
    await this.authService.removeFcmToken(userId);
  } catch (error) {
    console.log("❌ Error removing token:", error);
  }
}


  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    toast.present();
  }
}
