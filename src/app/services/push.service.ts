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
    console.log("Initializing Push Service...");

    if (Capacitor.getPlatform() === 'web') {
      console.warn("Push not supported on web");
      return;
    }

    // 1️⃣ CHECK + REQUEST PERMISSION
    let perm = await PushNotifications.checkPermissions();

    if (perm.receive !== 'granted') {
      perm = await PushNotifications.requestPermissions();
    }

    if (perm.receive !== 'granted') {
      console.error("Push permission not granted:", perm);
      return;
    }

    // 2️⃣ REGISTER FOR NOTIFICATIONS
    try {
      await PushNotifications.register();
      console.log("Push registration triggered");
    } catch (err) {
      console.error("Error during PushNotifications.register()", err);
    }

    this.setupListeners();
  }

  // 3️⃣ PUSH LISTENERS
  private setupListeners() {
    console.log("Setting up push listeners");

    // Token received
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log("Push Token:", token.value);
      this.analytics.log('push_token_received');
      await this.saveTokenToDB(token.value);
    });

    // Registration failed
    PushNotifications.addListener('registrationError', err => {
      console.error("Registration error:", err);
      this.analytics.log('push_registration_error', err);
    });

    // Notification received (foreground)
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log("Notification Received:", notification);
      }
    );

    // Notification tapped
    PushNotifications.addListener('pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.log("Notification Action:", action);
      }
    );
  }

  // 4️⃣ SAVE TOKEN IN SUPABASE
  private async saveTokenToDB(token: string) {
    console.log("Saving token:", token);

    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
      console.warn("No user found – token not saved");
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
      console.error("Token save error:", error);
      this.analytics.log('token_save_error', error);
    } else {
      console.log("Token saved successfully");
    }
  }

  // 5️⃣ DELETE TOKEN (LOGOUT USE CASE)
  async deleteToken(userId: string) {
    console.log("Deleting token for user:", userId);

    const { error } = await supabase
      .from('user_tokens')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error("Error deleting token:", error);
    } else {
      console.log("Token deleted");
    }
  }
}
