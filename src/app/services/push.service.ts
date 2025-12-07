import { Injectable } from '@angular/core';
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { supabase } from './supabase.client';
import { FirebaseAnalyticsService } from './firebase-analytics.service';

@Injectable({ providedIn: 'root' })
export class PushService {
  constructor(private analytics: FirebaseAnalyticsService) {}

  async init() {
    console.log("📲 Initializing Push Service...");

    // ============================
    // 1️⃣ REQUEST PUSH PERMISSIONS (iOS required)
    // ============================
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('❌ Push permission NOT granted');
      return;
    }

    // ============================
    // 2️⃣ REQUEST FIREBASE PERMISSION (iOS required)
    // ============================
    const firebasePerm = await FirebaseMessaging.requestPermissions();

    if (
      firebasePerm.authorizationStatus === 'notDetermined' ||
      firebasePerm.authorizationStatus === 'denied'
    ) {
      console.warn('❌ Firebase Messaging permission NOT granted');
      return;
    }

    // ============================
    // 3️⃣ REGISTER FOR PUSH (APNs)
    // ============================
    await PushNotifications.register();

    // ============================
    // 4️⃣ ANDROID TOKEN
    // ============================
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('📌 Android FCM Token:', token.value);
      await this.storeToken(token.value);
    });

    // ============================
    // 5️⃣ iOS FCM TOKEN
    // ============================
    FirebaseMessaging.addListener('tokenReceived', async (event) => {
      console.log('📌 iOS FCM Token:', event.token);
      await this.storeToken(event.token);
    });

    // Fallback iOS token fetch
    try {
      const result = await FirebaseMessaging.getToken();
      if (result?.token) {
        console.log('📌 iOS FCM Token (fallback):', result.token);
        await this.storeToken(result.token);
      }
    } catch (err) {
      console.log('⚠️ iOS getToken() error:', err);
    }

    // ============================
    // 6️⃣ NOTIFICATION RECEIVED
    // ============================
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('📨 Push Received:', notification);
      this.analytics.log('push_received', {
        title: notification.title,
        id: notification.id,
      });
    });
  }

  // ============================
  // SAVE TOKEN TO SUPABASE
  // ============================
  private async storeToken(token: string) {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    const { error } = await supabase
      .from('user_tokens')
      .upsert(
        {
          user_id: data.user.id,
          fcm_token: token,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('❌ Failed to save token:', error);
      this.analytics.log('push_token_save_error');
    }
  }

  async deleteTokens(userId: string) {
    await supabase.from('user_tokens').delete().eq('user_id', userId);
  }
}
