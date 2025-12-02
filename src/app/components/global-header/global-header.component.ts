import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { supabase } from 'src/app/services/supabase.client'; // adjust path

@Component({
  standalone: false,
  selector: 'app-global-header',
  templateUrl: './global-header.component.html',
  styleUrls: ['./global-header.component.scss']
})
export class GlobalHeaderComponent implements OnInit {
  unreadCount = 0;
  userId: string | null = null;
  profileImageUrl: string | null = null;

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    // ✅ Get current user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('Auth error:', userError.message);
      return;
    }

    if (user) {
      this.userId = user.id;

      // ✅ Fetch unread notifications
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', this.userId)
        .eq('is_read', false);

      if (!error) {
        this.unreadCount = count || 0;
      }

      // ✅ Fetch profile image from contractors table
      await this.loadUserProfile();
    }
  }

  private async loadUserProfile() {
    if (!this.userId) return;

    const { data, error } = await supabase
      .from('contractors')
      .select('profile_image_url')
      .eq('id', this.userId)
      .single();

    if (error) {
      console.error('Error fetching profile image:', error.message);
      this.profileImageUrl = null;
      return;
    }

    this.profileImageUrl = data?.profile_image_url || null;
  }

  async logout() {
    await this.authService.signOut();
    this.navCtrl.navigateRoot('/auth/login');
  }

  goToSettings() {
    this.router.navigate(['/tabs/profile']);
  }

  goToNotifications() {
    this.router.navigate(['/tabs/notifications']);
  }
  goBack() {
  this.navCtrl.back(); // goes to previous page dynamically
}
  goToHelp() {
    this.router.navigate(['/tabs/help']);
  }
}
