import { Component } from '@angular/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from './services/supabase.client';
import { PushService } from './services/push.service';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform, NavController } from '@ionic/angular';  
import { Device } from '@capacitor/device';
@Component({
  standalone: false,
  selector: 'app-root',
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `
})
export class AppComponent {
  constructor(
    private pushService: PushService,
    private platform: Platform,
    private navCtrl: NavController
  ) {
    this.pushService.init(); // register push on startup
    this.initializeApp(); this.initialize();
  }
   async initialize() {
    await this.platform.ready();

    // Overlay webview under status bar
    await StatusBar.setOverlaysWebView({ overlay: true });

    // Detect device
    const info = await Device.getInfo();
    if (info.platform === 'android') {
      // Estimate status bar height in px
      document.documentElement.style.setProperty('--status-bar-height', '24px');
    } else {
      // iOS will use safe-area-inset-top
      document.documentElement.style.setProperty('--status-bar-height', 'env(safe-area-inset-top)');
    }
  }
  async initializeApp() {
    this.platform.ready().then(async () => {
      // Status bar setup
      StatusBar.setOverlaysWebView({ overlay: false });
      StatusBar.setBackgroundColor({ color: '#4267B2' });
      StatusBar.setStyle({ style: Style.Light });

      // ✅ Auth check
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Auth check failed:', error.message);
        this.navCtrl.navigateRoot('/auth/login');
        return;
      }

      if (user) {
        this.navCtrl.navigateRoot('/tabs/dashboard'); // already logged in
      } else {
        this.navCtrl.navigateRoot('/auth/login'); // not logged in
      }
    });
  }
}
