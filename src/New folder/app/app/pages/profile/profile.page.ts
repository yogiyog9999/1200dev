import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { supabase } from '../../services/supabase.client';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  //styleUrls: ['./profile.page.scss']
})
export class ProfilePage implements OnInit {
 profile: any = {};
  userId = '';
  business_name = '';
  trade = '';
  city = '';
  state = '';
  country = '';
  license_number = '';
  profile_image_url = '';

  loading = false;
  error = '';
  success = '';

  constructor(private route: ActivatedRoute, private router: Router, private auth: AuthService) {}

  ngOnInit() {
    // Get userId from query params
    this.route.queryParams.subscribe(async params => {
      this.userId = params['userId'];
      if (!this.userId) return;

      // Load existing profile if exists
      const profile = await this.auth.getProfile(this.userId);
      if (profile) {
        this.business_name = profile.business_name || '';
        this.trade = profile.trade || '';
        this.city = profile.city || '';
        this.state = profile.state || '';
        this.country = profile.country || '';
        this.license_number = profile.license_number || '';
        this.profile_image_url = profile.profile_image_url || '';
      }
    });
  }

  // Upload profile image to Supabase Storage
  async uploadImage(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${this.userId}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;

    this.loading = true;
    try {
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;
 const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(filePath);

if (data?.publicUrl) {
  this.profile.avatar_url = data.publicUrl;
}
    } catch (e: any) {
      this.error = e.message || 'Image upload failed';
    } finally {
      this.loading = false;
    }
  }

  // Save profile details
  async saveProfile() {
    if (!this.userId) {
      this.error = 'No user found';
      return;
    }

    // Validate required fields
    if (!this.business_name || !this.trade || !this.city || !this.state || !this.country) {
      this.error = 'Please fill all required fields';
      return;
    }

    this.loading = true;
    this.error = '';
    try {
      await this.auth.updateProfile(this.userId, {
        business_name: this.business_name,
        trade: this.trade,
        city: this.city,
        state: this.state,
        country: this.country,
        license_number: this.license_number,
        profile_image_url: this.profile_image_url
      });

      this.success = 'Profile updated successfully!';
      this.router.navigate(['/dashboard']); // Redirect after update
    } catch (e: any) {
      this.error = e.message || 'Failed to save profile';
    } finally {
      this.loading = false;
    }
  }
}
