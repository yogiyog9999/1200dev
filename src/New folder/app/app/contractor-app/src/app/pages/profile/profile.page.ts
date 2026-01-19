import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { supabase } from '../../services/supabase.client';
import { AuthService, ContractorProfile } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})
export class ProfilePage implements OnInit {
  userId = '';
  form: ContractorProfile = {
    business_name: '',
    trade: '',
    city: '',
    state: '',
    country: '',
    license_number: '',
    profile_image_url: ''
  };
  loading = false;
  error = '';
  success = '';

  constructor(private route: ActivatedRoute, private router: Router, private auth: AuthService) {}

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      this.userId = params['userId'];
      if (!this.userId) {
        const user = await this.auth.currentUser();
        if (user) this.userId = user.id;
      }
      if (!this.userId) return;

      const existing = await this.auth.getProfile(this.userId);
      if (existing) this.form = { ...existing };
    });
  }

  async uploadImage(event: any) {
    const file = event.target.files[0];
    if (!file || !this.userId) return;
    const ext = file.name.split('.').pop();
    const path = `profile-images/${this.userId}.${ext}`;

    this.loading = true;
    try {
      const { error: uploadError } = await supabase.storage.from('profile-images').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('profile-images').getPublicUrl(path);
      this.form.profile_image_url = data.publicUrl;
    } catch (e: any) {
      this.error = e.message || 'Image upload failed';
    } finally {
      this.loading = false;
    }
  }

  async save() {
    if (!this.userId) { this.error = 'No user'; return; }
    const required = ['business_name','trade','city','state','country'] as const;
    for (const k of required) {
      if (!(this.form as any)[k]) {
        this.error = 'Please fill all required fields.';
        return;
      }
    }
    this.loading = true;
    this.error = '';
    try {
      await this.auth.upsertProfile(this.userId, this.form);
      this.success = 'Profile saved!';
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.error = e.message || 'Failed to save profile';
    } finally {
      this.loading = false;
    }
  }
}
