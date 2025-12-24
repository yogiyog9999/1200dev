import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { supabase } from '../../services/supabase.client';
import { AuthService, ContractorProfile } from '../../services/auth.service';
import { ToastController, LoadingController, AlertController} from '@ionic/angular';
import { ReviewService } from '../../services/review.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})
export class ProfilePage implements OnInit {
  userId = '';
  user: any = {};          // user info including profile image
  reviewCount: number = 0; // number of reviews
  userBadge: any; 
  isLoading = false; 
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
    profile_image_url: ''
  };
services: any[] = [];
states: any[] = [];

  constructor(
    private reviewSvc: ReviewService,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private toastCtrl: ToastController,
    private alertController: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  async ngOnInit() {
    this.isLoading = true; // start loading
    try {
      this.services = await this.reviewSvc.getServices();
    } catch (err) {
      console.error('Failed to load services:', err);
    }
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
      if (existing) {
  this.form = { ...existing };

  // format phone for UI
  if (existing.phone) {
    this.form.phone = this.formatPhoneValue(existing.phone);
  }
}


      this.isLoading = false; // stop loading
    });
	
	try {
    this.states = await this.reviewSvc.getStates(); // fetch from service
  } catch (err) {
    console.error('Failed to load states', err);
    this.presentToast('Failed to load states', 'danger');
  }
  
  try {
    this.userBadge = await this.reviewSvc.fetchUserBadge(this.userId);
  } catch (err) {
    console.error('Failed to fetch user badge', err);
  }
   this.reviewCount = await this.reviewSvc.getUserReviewCount(this.userId);
  
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
 async pickImage() {
  try {
    const image = await Camera.getPhoto({
      quality: 70,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt
    });

    if (!image.webPath) return;

    const res = await fetch(image.webPath);
    const blob = await res.blob();

    const file = new File([blob], `profile_${Date.now()}.jpg`, {
      type: 'image/jpeg'
    });

    this.uploadImageFile(file);
  } catch (e) {
    console.log('Camera cancelled', e);
  }
}

  async uploadImageFile(file: File) {
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
    this.form.profile_image_url = `${data.publicUrl}?t=${Date.now()}`;

    // Optional: also save in DB
    await this.auth.upsertProfile(this.userId, { ...this.form });

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
  const required = ['business_name', 'trade', 'city', 'state'] as const;
  for (const k of required) {
    if (!(this.form as any)[k]) {
      this.presentToast(`Please fill ${k.replace('_', ' ')}`, 'warning');
      return;
    }
  }

  // --- Phone validation ---
// --- Phone validation ---
const phoneRaw = String(this.form.phone || '').replace(/\D/g, '');

const phoneRegex = /^\d{10}$/;
if (!phoneRegex.test(phoneRaw)) {
  this.presentToast('Please enter a valid 10-digit US phone number', 'warning');
  return;
}

// save raw digits ONLY
const rawPhoneToSave = phoneRaw;


  // --- ZIP validation ---
  const zipRegex = /^\d{5}$/;
  if (!zipRegex.test(this.form.zip || '')) {
    this.presentToast('Please enter a valid 5-digit ZIP code', 'warning');
    return;
  }

  const loading = await this.loadingCtrl.create({ message: 'Saving...' });
  await loading.present();

  try {
await this.auth.upsertProfile(this.userId, {
  ...this.form,
  phone: rawPhoneToSave
});
    this.presentToast('Profile saved successfully!', 'success');
    this.router.navigate(['/tabs/profile']);
  } catch (e: any) {
    this.presentToast(e.message || 'Failed to save profile', 'danger');
  } finally {
    loading.dismiss();
  }
}
onPhoneInput(event: any) {
  let input = event.target.value || '';

  // Remove everything that is NOT a number
  input = input.replace(/\D/g, '');

  // Limit to 10 digits
  if (input.length > 10) {
    input = input.substring(0, 10);
  }

  // Apply formatting only AFTER cleaning digits
  if (input.length >= 6) {
    event.target.value = `(${input.substring(0, 3)}) ${input.substring(3, 6)}-${input.substring(6)}`;
  } else if (input.length >= 3) {
    event.target.value = `(${input.substring(0, 3)}) ${input.substring(3)}`;
  } else {
    event.target.value = input;
  }

  // Update form
  this.form.phone = event.target.value;
}

formatPhoneValue(phone: string | number): string {
  const p = String(phone).replace(/\D/g, '');
  if (p.length !== 10) return p;
  return `(${p.substring(0, 3)}) ${p.substring(3, 6)}-${p.substring(6)}`;
}
async confirmDelete() {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Are you sure you want to submit a delete request for your account?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes, Proceed',
          handler: () => {
            this.router.navigate(['/delete']);
          }
        }
      ]
    });

    await alert.present();
  }
}
