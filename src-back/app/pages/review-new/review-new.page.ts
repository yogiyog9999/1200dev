import { Component } from '@angular/core';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { supabase } from '../../services/supabase.client';

@Component({
  standalone: false,
  selector: 'app-review-new',
  templateUrl: './review-new.page.html',
  styleUrls: ['./review-new.page.scss']
})
export class ReviewNewPage {
  homeowner_name = '';
  project_type = '';
  address = '';
  zip = '';
  project_date = '';
  rating_payment = 5;
  rating_communication = 5;
  rating_scope = 5;
  rating_change_orders = 5;
  rating_overall = 5;
  comments = '';
  files: File[] = [];
  me: any;
  services: any[] = [];
  ratingCategories = [
  { label: 'Payment Timeliness', model: 0 },
  { label: 'Communication', model: 0 },
  { label: 'Scope Clarity', model: 0 },
  { label: 'Change Order Fairness', model: 0 },
  { label: 'Overall Experience', model: 0 }
];

  constructor(
    private reviewSvc: ReviewService,
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

   async ngOnInit() {
    try {
      this.services = await this.reviewSvc.getServices();
    } catch (err) {
      console.error('Failed to load services:', err);
    }
  }
  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
    });
    toast.present();
  }

  async submit() {
    this.me = await this.auth.currentUser();
    if (!this.me) {
      this.presentToast('Not logged in', 'danger');
      return;
    }

    // basic validation
    if (!this.homeowner_name || !this.address || !this.zip || !this.project_type) {
      this.presentToast('Please fill all required fields', 'danger');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Submitting review...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      const review = {
        contractor_id: this.me.id,
        homeowner_name: this.homeowner_name,
        address: this.address,
        zip: this.zip,
        project_type: this.project_type,
        project_date: this.project_date || null,
        rating_payment: this.rating_payment,
        rating_communication: this.rating_communication,
        rating_scope: this.rating_scope,
        rating_change_orders: this.rating_change_orders,
        rating_overall: this.rating_overall,
        comments: this.comments,
		 auto_flag: (
    this.rating_payment <= 2 ||
    this.rating_communication <= 2 ||
    this.rating_scope <= 2 ||
    this.rating_change_orders <= 2 ||
    this.rating_overall <= 2
  ),
      };

      // upload files to supabase storage
      const uploadedUrls: string[] = [];
      for (const file of this.files) {
        const ext = file.name.split('.').pop();
        const path = `reviews/${this.me.id}_${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('profile-images').upload(path, file, {
          upsert: true,
        });
        if (error) throw error;

        const { data } = supabase.storage.from('profile-images').getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }

      // save review with files
      await this.reviewSvc.submitReview({ ...review, files: uploadedUrls });
      this.router.navigateByUrl('/tabs/thanks', { replaceUrl: true });
    } catch (e: any) {
      this.presentToast(e.message || 'Failed to submit review', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  onFileChange(ev: any) {
    this.files = Array.from(ev.target.files || []);
  }
}
