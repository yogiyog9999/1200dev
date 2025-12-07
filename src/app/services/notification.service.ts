import { Injectable } from '@angular/core';
import { supabase } from '../services/supabase.client';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  // Fetch all notifications
  async getUserNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  }

  // Listen for new notifications (iOS safe)
  listenNewNotifications(userId: string, callback: (data: any) => void) {
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: user_id=eq.${userId}
        },
        (payload) => {
          console.log('Realtime new notification:', payload.new);
          callback(payload.new);
        }
      )
      .subscribe((status) => {
        console.log('Realtime status:', status); // for debugging iOS
      });

    return channel; // You can unsubscribe later
  }

  // Mark notification as read
  async markAsRead(notificationId: number) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking as read:', error);
    }
  }
}
