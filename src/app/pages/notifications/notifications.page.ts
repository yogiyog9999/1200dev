import { Component, OnInit } from '@angular/core';
import { supabase } from '../../services/supabase.client';
//import { AuthService } from '../../services/auth.service';
@Component({
  standalone: false,
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  notifications: any[] = [];
  userId: string | null = null;
  
  async ngOnInit() {
    const { data: { user } } = await supabase.auth.getUser();
    this.userId = user?.id ?? null;

    if (this.userId) {
      await this.loadNotifications();
    }
  }

  async loadNotifications() {
    const { data, error } = await supabase
      .from('notifications')
    .select('*')
    .eq('user_id', this.userId)
    .order('created_at', { ascending: false })
    .limit(10);

    if (!error) {
      this.notifications = data ?? [];
    }
  }

  async markAsRead(notificationId: number) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (!error) {
      this.notifications = this.notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
    }
  }

  async markAllAsRead() {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', this.userId);

    if (!error) {
      this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    }
  }
}
