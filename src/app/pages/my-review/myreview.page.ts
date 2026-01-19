import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReviewService } from '../../services/review.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
   standalone: false,
  selector: 'app-myreview',
  templateUrl: './myreview.page.html',
  styleUrls: ['./myreview.page.scss']
})
export class MyreviewPage implements OnInit {
  contractor: any;
  avgRating: number | null = null;
  reviewedHomeowners: any[] = [];
  totalReviews: number | null = null;
  isLoading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private reviewSvc: ReviewService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    // good for one-time setup
  }

  // 👇 will fire each time page is shown
  async ionViewWillEnter() {
    await this.loadData();
  }

  private async loadData() {
    this.isLoading = true;
    try {
      const user = await this.auth.currentUser();
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      this.contractor = await this.auth.getContractorProfile(user.id);

      const reviews = await this.auth.getContractorReviews(user.id);

      if (reviews && reviews.length > 0) {
        const scores = reviews.map((r: any) => Number(r.avg_score)).filter(n => Number.isFinite(n));

        const totalReviews = scores.length;
        const avg = totalReviews > 0 
          ? scores.reduce((acc, n) => acc + n, 0) / totalReviews 
          : 0;

        this.avgRating = +avg.toFixed(1);
        this.totalReviews = totalReviews;

        this.reviewedHomeowners = reviews.map((r: any) => ({
          reviewid: r.id,
          fname: r.homeowner_first_name,
          lname: r.homeowner_last_name,
          projectType: r.project_type || 'N/A',
          projectDate: r.project_date ? new Date(r.project_date).toLocaleDateString() : 'N/A',
          comments: r.comments || '',
          avgScore: r.avg_score || 0,
          ratingOverall: r.rating_overall || 0,
          ratingPayment: r.rating_payment || 0,
          ratingCommunication: r.rating_communication || 0,
          ratingScope: r.rating_scope || 0,
          ratingChangeOrders: r.rating_change_orders || 0,
          profilePicture: r.profile_picture || 'assets/default-user.png',
          address: r.address || '',
          zip: r.zip || ''
        }));
      } else {
        this.avgRating = 0;
        this.totalReviews = 0;
        this.reviewedHomeowners = [];
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      this.isLoading = false;
    }
  }


  viewReviews() {
    this.router.navigate(['/tabs/reviews']);
  }

  openReviewDetails(reviewId: number) {
    this.router.navigate(['/tabs/review-details', reviewId]);
  }

  // ✅ Navigate to edit page
  editReview(review: any, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/tabs/review-edit', review.reviewid]);
  }

  // ✅ Confirm and delete review
  async deleteReview(review: any, event: Event) {
    event.stopPropagation();
    const alert = await this.alertCtrl.create({
      header: 'Delete Review',
      message: 'Are you sure you want to delete this review?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              await this.reviewSvc.deleteReview(review.reviewid);
              this.reviewedHomeowners = this.reviewedHomeowners.filter(r => r.reviewid !== review.reviewid);
              this.presentToast('Review deleted successfully');
            } catch (err) {
              console.error('Delete failed', err);
              this.presentToast('Failed to delete review', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color
    });
    toast.present();
  }

  logout() {
    this.auth.signOut();
    this.router.navigate(['/auth/login']);
  }
}
