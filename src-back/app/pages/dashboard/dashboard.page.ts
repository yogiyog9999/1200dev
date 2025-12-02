import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
//import { SupabaseService } from '../../services/supabase.service';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage implements OnInit {
  contractor: any;
  avgRating: number | null = null;
  reviewedHomeowners: any[] = [];
  totalReviews: number | null = null;

  isLoading: boolean = false; // <-- loading state

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.isLoading = true; // start loader
    try {
      const user = await this.auth.currentUser();
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      this.contractor = await this.auth.getContractorProfile(user.id);

      const reviews = await this.auth.getContractorReviews(user.id);

      if (reviews && reviews.length > 0) {
        // Ensure numeric scores
        const scores = reviews
          .map((r: any) => Number(r.avg_score))
          .filter(n => Number.isFinite(n));

        const totalReviews = scores.length;
        const avg = totalReviews > 0 
          ? scores.reduce((acc, n) => acc + n, 0) / totalReviews 
          : 0;

        this.avgRating = +avg.toFixed(1);
        this.totalReviews = totalReviews;

        this.reviewedHomeowners = reviews.map((r: any) => ({
          name: r.homeowner_name,
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
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      this.isLoading = false; // stop loader
    }
  }

  viewReviews() {
    this.router.navigate(['/tabs/reviews']);
  }

  openReviewDetails(homeownerName: string) {
    this.router.navigate(['/tabs/review-details', homeownerName]);
  }

  logout() {
    this.auth.signOut();
    this.router.navigate(['/auth/login']);
  }
}
