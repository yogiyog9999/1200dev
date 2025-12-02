import { Component } from '@angular/core';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-review-new',
  templateUrl: './review-new.page.html',
  //styleUrls: ['./review-new.page.scss']
})
export class ReviewNewPage {
  homeowner_id = '';
  project_type = '';
  project_date = '';
  rating_payment = 5;
  rating_communication = 5;
  rating_scope = 5;
  rating_change_orders = 5;
  rating_overall = 5;
  comments = '';
  files: File[] = [];
  me: any;
  error = '';

  constructor(
    private reviewSvc: ReviewService,
    private auth: AuthService,
    private router: Router
  ) {}

  async submit() {
    this.me = await this.auth.currentUser();
    if (!this.me) {
      this.error = 'Not logged in';
      return;
    }

    try {
      const review = {
        contractor_id: this.me.id,
        homeowner_id: this.homeowner_id,
        project_type: this.project_type,
        project_date: this.project_date || null,
        rating_payment: this.rating_payment,
        rating_communication: this.rating_communication,
        rating_scope: this.rating_scope,
        rating_change_orders: this.rating_change_orders,
        rating_overall: this.rating_overall,
        comments: this.comments
      };
      await this.reviewSvc.submitReview(review, this.files);
      this.router.navigateByUrl('/dashboard');
    } catch (e: any) {
      this.error = e.message || 'Failed to submit';
    }
  }

  onFileChange(ev: any) {
    this.files = Array.from(ev.target.files || []);
  }
}
