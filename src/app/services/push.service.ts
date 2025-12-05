import { Injectable } from '@angular/core';
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed
} from '@capacitor/push-notifications';

import { Capacitor } from '@capacitor/core';
import { supabase } from './supabase.client';
import { FirebaseAnalyticsService } from './firebase-analytics.service';

@Injectable({ providedIn: 'root' })
export class PushService {

  constructor(private analytics: FirebaseAnalyticsService) {}

  async init() {
    alert("🔄 PushService.init() called");
    console.log("🚀 Initializing Push Service...");

    if (Capacitor.getPlatform() === 'web') {
      alert("❌ Push does NOT work on web");
      console.warn("Push not supported on web");
      return;
    }

    // -----------------------------------------
    // 1️⃣ CHECK + REQUEST PERMISSION
    // -----------------------------------------
    let perm = await PushNotifications.checkPermissions();
    alert("🔍 checkPermissions: " + JSON.stringify(perm));

    if (perm.receive !== 'granted') {
      alert("⏳ Requesting permission...");
      perm = await PushNotifications.requestPermissions();
      alert("📌 requestPermissions result: " + JSON.stringify(perm));
    }

    if (perm.receive !== 'granted') {
      alert("❌ Push NOT granted!");
      console.error("Push permission not granted:", perm);
      return;
    }

    // -----------------------------------------
    // 2️⃣ REGISTER FOR NOTIFICATIONS
    // -----------------------------------------
    try {
      alert("📡 Calling PushNotifications.register()...");
      await PushNotifications.register();
      alert("✅ PushNotifications.register() CALLED successfully");
    } catch (err) {
      alert("❌ ERROR calling register()");
      console.error(err);
    }

    this.setupListeners();
  }

  // ---------------------------------------------------
  // 3️⃣ LISTENERS (TOKEN + RECEIVED + CLICK ACTION)
  // ---------------------------------------------------
  private setupListeners() {
    alert("📌 Setting up listeners...");

    // ✔ Token received (APNs or FCM bridged token)
    PushNotifications.addListener('registration', async (token: Token) => {
      alert("🔥 TOKEN RECEIVED: " + token.value);
      console.log("🔥 Push Token:", token.value);

      this.analytics.log('push_token_received');
      await this.saveTokenToDB(token.value);
    });

    // ❌ Registration failed
    PushNotifications.addListener('registrationError', err => {
      alert("❌ registrationError: " + JSON.stringify(err));
      console.error("registrationError:", err);

      this.analytics.log('push_registration_error', err);
    });

    // 📩 Notification received when app is open
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        alert("📨 Push Received!\n" + JSON.stringify(notification));
        console.log("📨 Notification Received:", notification);
    });

    // 📌 Notification tapped
    PushNotifications.addListener('pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        alert("👉 Notification Clicked:\n" + JSON.stringify(action));
        console.log("📌 Notification Action:", action);
    });
  }

  // ---------------------------------------------------
  // SAVE TOKEN IN SUPABASE
  // ---------------------------------------------------
  private async saveTokenToDB(token: string) {
    alert("💾 Saving token: " + token);

    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
      alert("⚠ No user logged in → Token NOT saved");
      console.warn("No user found");
      return;
    }

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
      alert("❌ ERROR saving token\n" + JSON.stringify(error));
      console.error("Token save error:", error);
      this.analytics.log('token_save_error', error);
    } else {
      alert("✅ Token SAVED successfully!");
      console.log("Token saved successfully!");
    }
  }

  // ---------------------------------------------------
  // DELETE TOKEN (LOGOUT USE CASE)
  // ---------------------------------------------------
  async deleteToken(userId: string) {
    alert("🗑 Deleting token for user: " + userId);

    const { error } = await supabase
      .from('user_tokens')
      .delete()
      .eq('user_id', userId);

    if (error) {
      alert("❌ ERROR deleting token\n" + JSON.stringify(error));
      console.error(error);
    } else {
      alert("🗑 Token deleted!");
      console.log("Token deleted");
    }
  }
}
