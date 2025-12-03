import { Injectable } from '@angular/core';
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { supabase } from './supabase.client';
import { FirebaseAnalyticsService } from './firebase-analytics.service';

@Injectable({ providedIn: 'root' })
export class PushService {
  constructor(private analytics: FirebaseAnalyticsService) {}

  async init() {
    // 🔐 Check + Request permissions
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }
    if (permStatus.receive !== 'granted') {
      console.warn('Push permission NOT granted');
      return;
    }

    // Register for push
    await PushNotifications.register();

    // ============================
    // 🔥 ANDROID FCM TOKEN
    // ============================
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Android FCM token:', token.value);
      this.analytics.log('push_token_generated');

      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await this.saveToken(data.user.id, token.value);
      }
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('Push registration error:', err);
      this.analytics.log('push_registration_error', { error: JSON.stringify(err) });
    });

    // ============================
    // 🔥 iOS FCM TOKEN via Firebase Messaging
    // ============================
    try {
      const fcm = await FirebaseMessaging.getToken();

      if (fcm?.token) {
        console.log('iOS FCM token:', fcm.token);

        const { data } = await supabase.auth.getUser();
        if (data.user) {
          await this.saveToken(data.user.id, fcm.token);
        }
      }
    } catch (err) {
      console.log('iOS token error:', err);
    }

    // PUSH RECEIVED
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
        { onConflict: 'user_id' }
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
