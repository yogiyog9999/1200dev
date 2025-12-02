import { Injectable } from '@angular/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { supabase } from './supabase.client';

@Injectable({ providedIn: 'root' })
export class PushService {
  constructor() {}

  async init() {
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }
    if (permStatus.receive !== 'granted') {
      console.warn('Push permission not granted');
      return;
    }

    // Always register
    await PushNotifications.register();

    // On registration
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('✅ Got FCM token:', token.value);

      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await this.saveToken(data.user.id, token.value);
      } else {
        alert('⚠️ Not logged in, token not saved');
      }
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('❌ Push registration error:', err);
      alert('❌ Push registration failed: ' + JSON.stringify(err));
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
      console.error('❌ Error saving token:', error);
      //alert('❌ Error saving token: ' + error.message);
    } else {
      //alert('✅ Push token saved successfully!');
    }
  }

  async deleteTokens(userId: string) {
    const { error } = await supabase
      .from('user_tokens')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error deleting tokens:', error);
      alert('❌ Error deleting token: ' + error.message);
    } else {
      alert('🗑️ Push token deleted on logout');
    }
  }
}
