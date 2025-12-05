import { Injectable } from '@angular/core';
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { supabase } from './supabase.client';
import { FirebaseAnalyticsService } from './firebase-analytics.service';

@Injectable({ providedIn: 'root' })
export class PushService {
  constructor(private analytics: FirebaseAnalyticsService) {}

  async init() {
    console.log("🔄 Initializing Push Service...");

    // ======================================
    // 1️⃣ Check Permission
    // ======================================
    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === 'prompt') {
      perm = await PushNotifications.requestPermissions();
    }

    if (perm.receive !== 'granted') {
      alert("❌ Push Permission NOT granted!");
      console.warn("Push Not Granted");
      return;
    }

    // ======================================
    // 2️⃣ Register for Notifications
    // ======================================
    try {
      await PushNotifications.register();
      console.log("📌 PushNotifications.register() called");
    } catch (err) {
      alert("❌ Error calling PushNotifications.register()");
      console.error(err);
    }

    // ======================================
    // 3️⃣ Token Listener (APNs + Android)
    // ======================================
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log("📌 APNs/Android token received:", token.value);
      alert("📌 Native Token Received!");

      this.analytics.log('push_token_received');

      // Now fetch FCM token (Android & iOS)
      await this.getFcmTokenAndSave();
    });

    PushNotifications.addListener('registrationError', (err) => {
      alert("❌ ERROR: registrationError");
      console.error("registrationError:", err);
      this.analytics.log('push_registration_error', { error: JSON.stringify(err) });
    });

    // ======================================
    // 4️⃣ Notification Received
    // ======================================
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log("📨 Push Received:", notification);
      this.analytics.log('push_received', {
        title: notification.title,
        id: notification.id
      });
    });
  }

  // =================================================
  // FCM TOKEN FETCH + SAVE (iOS + Android)
  // =================================================
  async getFcmTokenAndSave(retry = 0) {
    try {
      console.log("🔍 Fetching FCM token...");
      const fcm = await FirebaseMessaging.getToken();

      if (!fcm?.token) {
        console.log("⚠ FCM Token NULL");

        if (retry < 3) {
          console.log(`⏳ Retrying FCM token... Attempt ${retry + 1}`);
          setTimeout(() => this.getFcmTokenAndSave(retry + 1), 1500);
        } else {
          alert("❌ FCM Token is NULL. Push may not work!");
        }

        return;
      }

      console.log("🔥 FCM Token:", fcm.token);
      alert("🔥 FCM Token Generated!");

      const { data } = await supabase.auth.getUser();

      if (data.user) {
        await this.saveToken(data.user.id, fcm.token);
      }

    } catch (err) {
      alert("❌ Error fetching FCM token");
      console.error("FCM token error:", err);
    }
  }

  // =================================================
  // SAVE TOKEN IN SUPABASE
  // =================================================
  async saveToken(userId: string, token: string) {
    console.log("💾 Saving token to Supabase...");

    const { error } = await supabase
      .from('user_tokens')
      .upsert(
        {
          user_id: userId,
          fcm_token: token,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      alert("❌ Error saving token in DB");
      console.error("Save token error:", error);
      this.analytics.log('push_token_save_error');
    } else {
      alert("✅ Token Saved Successfully in DB");
      console.log("Token saved successfully!");
    }
  }

  // =================================================
  // DELETE TOKEN
  // =================================================
  async deleteTokens(userId: string) {
    console.log("🗑 Deleting user tokens...");

    const { error } = await supabase
      .from('user_tokens')
      .delete()
      .eq('user_id', userId);

    if (error) {
      alert("❌ Error deleting tokens");
      console.error(error);
    } else {
      alert("🗑 Token deleted!");
    }
  }
}
