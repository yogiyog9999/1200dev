import { Injectable } from '@angular/core';
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
import { supabase } from './supabase.client';
import { FirebaseAnalyticsService } from './firebase-analytics.service';  // <-- ADD

@Injectable({ providedIn: 'root' })
export class PushService {
  constructor(private analytics: FirebaseAnalyticsService) {}

  async init() {
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }
    if (permStatus.receive !== 'granted') {
      console.warn('Push permission not granted');
      return;
    }

    await PushNotifications.register();

    // 🔥 Token registration
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Got FCM token:', token.value);

      this.analytics.log('push_token_generated'); // 🔥

      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await this.saveToken(data.user.id, token.value);
      }
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('Push registration error:', err);
      this.analytics.log('push_registration_error', { error: JSON.stringify(err) });
    });

    // 🔥 Push received
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push received:', notification);
      this.analytics.log('push_received', {
        title: notification.title,
        id: notification.id
      });
    });
  }

  async saveToken(userId: string, fcmToken: string) {
    const { error } = await supabase
      .from('user_tokens')
      .upsert(
        {
          user_id: userId,
          fcm_token: fcmToken,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,fcm_token' }
      );

    if (error) {
      console.error('Error saving token:', error);
      this.analytics.log('push_token_save_error');
    }
  }

  async deleteTokens(userId: string) {
    await supabase.from('user_tokens').delete().eq('user_id', userId);
  }
}
