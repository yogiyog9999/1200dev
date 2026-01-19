import { Injectable } from '@angular/core';
import { supabase } from '../services/supabase.client';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  async getUserNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async markAsRead(notificationId: number) {
    await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
  }
}
