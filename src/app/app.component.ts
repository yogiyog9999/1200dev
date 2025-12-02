import { Component } from '@angular/core';
import { supabase } from './services/supabase.client';
import { PushService } from './services/push.service';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform, NavController } from '@ionic/angular';  
import { Device } from '@capacitor/device';
import { App as CapacitorApp } from '@capacitor/app';

import { FirebaseAnalyticsService } from './services/firebase-analytics.service';  // <-- ADD

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
  private sessionStart = 0; // for session tracking

  constructor(
    private pushService: PushService,
    private platform: Platform,
    private navCtrl: NavController,
    private analytics: FirebaseAnalyticsService // <-- ADD
  ) {
    this.pushService.init();
    this.initializeApp();
    this.handleDeepLinks();
  }

  async initializeApp() {
    await this.platform.ready();
          // Track FIRST OPEN & possibly INSTALL (only once)
    this.trackFirstOpen();

    // Track SESSION START
    this.sessionStart = Date.now();
    this.analytics.log("session_start");

    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#4267B2' });

    const info = await Device.getInfo();
    document.documentElement.style.setProperty('--status-bar-height', 'env(safe-area-inset-top)');

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Auth check failed:', error.message);
      this.navCtrl.navigateRoot('/auth/login');
      return;
    }

    if (user) {
      this.analytics.setUserId(user.id);  // <-- Track logged in user
      this.navCtrl.navigateRoot('/tabs/dashboard');
    } else {
      this.navCtrl.navigateRoot('/auth/login');
    }
  }

  // TRACK FIRST OPEN + INSTALL
  trackFirstOpen() {
    if (!localStorage.getItem('app_installed')) {
      this.analytics.log('app_install');
      localStorage.setItem('app_installed', '1');
    }
    this.analytics.log('first_open');
  }

  // TRACK DEEP LINKS
  handleDeepLinks() {
    CapacitorApp.addListener('appUrlOpen', (data: any) => {
      console.log('Deep link opened:', data.url);

      this.analytics.log('deep_link_opened', {
        url: data.url
      });

      const url = new URL(data.url.replace('dlist://', 'https://dummy.com/'));
      const hash = url.hash;

      if (url.pathname === '/reset-password' && hash) {
        const queryParams = new URLSearchParams(hash.substring(1));
        const accessToken = queryParams.get('access_token');
        const type = queryParams.get('type');

        if (type === 'recovery' && accessToken) {
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: queryParams.get('refresh_token') || ''
          });

          this.navCtrl.navigateForward('/reset-password');
        }
      }
    });
  }

  // TRACK SESSION END
  ngOnDestroy() {
    const duration = Math.round((Date.now() - this.sessionStart) / 1000);
    this.analytics.log('session_duration', { seconds: duration });
  }
}
