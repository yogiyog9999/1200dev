import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

import { supabase } from '../../services/supabase.client';
import { AuthService, ContractorProfile } from '../../services/auth.service';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})
export class ProfilePage implements OnInit {

  @ViewChild('fileInput', { static: false })
  fileInput!: ElementRef<HTMLInputElement>;

  userId = '';
  isLoading = false;
  reviewCount = 0;
  userBadge: any;

  services: any[] = [];
  states: any[] = [];

  form: ContractorProfile = {
    business_name: '',
    first_name: '',
    display_name: '',
    last_name: '',
    trade: '',
    city: '',
    state: '',
    country: '',
    license_number: '',
    phone: '',
    zip: '',
    profile_image_url: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private reviewSvc: ReviewService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    this.isLoading = true;

    const user = await this.auth.currentUser();
    if (user) this.userId = user.id;

    this.services = await this.reviewSvc.getServices();
    this.states = await this.reviewSvc.getStates();

    const existing = await this.auth.getProfile(this.userId);
    if (existing) {
      this.form = { ...existing };
      if (existing.phone) {
        this.form.phone = this.formatPhone(existing.phone);
      }
    }

    this.reviewCount = await this.reviewSvc.getUserReviewCount(this.userId);
    this.userBadge = await this.reviewSvc.fetchUserBadge(this.userId);

    this.isLoading = false;
  }

  /* ---------- FILE PICKER ---------- */
  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    await this.uploadImage(input.files[0]);
    input.value = '';
  }

  /* ---------- CAMERA ---------- */
  async pickImage() {
    const photo = await Camera.getPhoto({
      source: CameraSource.Camera,
      resultType: CameraResultType.Uri,
      quality: 75,
      presentationStyle: 'popover'
    });

    if (!photo.webPath) return;

    const blob = await (await fetch(photo.webPath)).blob();
    const file = new File([blob], `profile.jpg`, { type: 'image/jpeg' });

    await this.uploadImage(file);
  }

  /* ---------- UPLOAD ---------- */
  async uploadImage(file: File) {
    if (!file || !this.userId) return;

    const ext = file.name.split('.').pop();
    const path = `profile-images/${this.userId}.${ext}`;

    const loading = await this.loadingCtrl.create({ message: 'Uploading...' });
    await loading.present();

    try {
      await supabase.storage.from('profile-images').upload(path, file, { upsert: true });
      const { data } = supabase.storage.from('profile-images').getPublicUrl(path);

      this.form.profile_image_url = `${data.publicUrl}?t=${Date.now()}`;
      await this.auth.upsertProfile(this.userId, { profile_image_url: this.form.profile_image_url });

      this.toast('Profile image updated');
    } catch (e: any) {
      this.toast(e.message || 'Upload failed', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async save() {
    const phoneRaw = String(this.form.phone).replace(/\D/g, '');
    if (phoneRaw.length !== 10) {
      return this.toast('Invalid phone number', 'warning');
    }

    await this.auth.upsertProfile(this.userId, {
      ...this.form,
      phone: phoneRaw
    });

    this.toast('Profile saved');
  }

  onPhoneInput(e: any) {
    let v = e.target.value.replace(/\D/g, '').substring(0, 10);
    if (v.length >= 6) e.target.value = `(${v.slice(0,3)}) ${v.slice(3,6)}-${v.slice(6)}`;
    else if (v.length >= 3) e.target.value = `(${v.slice(0,3)}) ${v.slice(3)}`;
    this.form.phone = e.target.value;
  }

  formatPhone(v: string) {
    return `(${v.slice(0,3)}) ${v.slice(3,6)}-${v.slice(6)}`;
  }

  async confirmDelete() {
    const alert = await this.alertCtrl.create({
      header: 'Confirm',
      message: 'Delete your account?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Yes', handler: () => this.router.navigate(['/delete']) }
      ]
    });
    alert.present();
  }

  toast(msg: string, color: string = 'success') {
    this.toastCtrl.create({ message: msg, duration: 2000, color }).then(t => t.present());
  }
}
