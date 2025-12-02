import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { supabase } from '../../services/supabase.client';
import { AuthService, ContractorProfile } from '../../services/auth.service';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})
export class ProfilePage implements OnInit {
  userId = '';
  isLoading = false; 
  form: ContractorProfile = {
    business_name: '',
	first_name: '',
	last_name: '',
    trade: '',
    city: '',
    state: '',
    country: '',
    license_number: '',
    profile_image_url: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  async ngOnInit() {
    this.isLoading = true; // start loading

    this.route.queryParams.subscribe(async params => {
      this.userId = params['userId'];
      if (!this.userId) {
        const user = await this.auth.currentUser();
        if (user) this.userId = user.id;
      }
      if (!this.userId) {
        this.isLoading = false;
        return;
      }

      const existing = await this.auth.getProfile(this.userId);
      if (existing) this.form = { ...existing };

      this.isLoading = false; // stop loading
    });
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  async uploadImage(event: any) {
    const file = event.target.files[0];
    if (!file || !this.userId) return;

    const ext = file.name.split('.').pop();
    const path = `profile-images/${this.userId}.${ext}`;

    const loading = await this.loadingCtrl.create({ message: 'Uploading...' });
    await loading.present();

    try {
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('profile-images').getPublicUrl(path);
      this.form.profile_image_url = data.publicUrl;
      this.presentToast('Profile image updated!', 'success');
    } catch (e: any) {
      this.presentToast(e.message || 'Image upload failed', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async save() {
    if (!this.userId) {
      this.presentToast('No user found', 'danger');
      return;
    }

    // Required field validation
    const required = ['business_name', 'trade', 'city', 'state', 'country'] as const;
    for (const k of required) {
      if (!(this.form as any)[k]) {
        this.presentToast(`Please fill ${k.replace('_', ' ')}`, 'warning');
        return;
      }
    }

    const loading = await this.loadingCtrl.create({ message: 'Saving...' });
    await loading.present();

    try {
      await this.auth.upsertProfile(this.userId, this.form);
      this.presentToast('Profile saved successfully!', 'success');
      this.router.navigate(['/tabs/profile']);
    } catch (e: any) {
      this.presentToast(e.message || 'Failed to save profile', 'danger');
    } finally {
      loading.dismiss();
    }
  }
}
