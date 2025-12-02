import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage implements OnInit {
  reviews: any[] = [];
  me: any;

  constructor(
    private reviewSvc: ReviewService,
    private auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.me = await this.auth.currentUser();
    if (!this.me) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.reviews = await this.reviewSvc.myReviews(this.me.id);
  }
}
