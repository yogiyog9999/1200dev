import { Component, OnInit } from '@angular/core';
import { HomeownersService } from '../../services/homeowners.service';
import { Router } from '@angular/router';
@Component({
  standalone: false,
  selector: 'app-homeowners',
  templateUrl: './homeowners.page.html',
  styleUrls: ['./homeowners.page.scss']
  
})
export class HomeownersPage implements OnInit {
  q = '';
  postal = '';
  proj = '';
  minRating: number | null = null;

  results: any[] = [];
  loading = false;
  error = '';
  page = 1;
  pageSize = 10;
  hasMore = true;

  showFilters = false;
services = [
  { name: 'Painting' },
  { name: 'Flooring' },
  { name: 'Plumbing' },
  { name: 'Electrical' },
  { name: 'Roofing' }
];
  constructor(private svc: HomeownersService,private router: Router) {}

  ngOnInit() {
    this.loadReviews(true); // first time load all
  }

  async loadReviews(reset = false) {
    if (reset) {
      this.page = 1;
      this.results = [];
      this.hasMore = true;
    }
    if (!this.hasMore) return;

    this.loading = true;
    try {
      const data = await this.svc.search(
        this.q,
        this.postal,
        this.proj,
        this.minRating ?? undefined,
        this.page,
        this.pageSize
      );
      if (data.length < this.pageSize) this.hasMore = false;
      this.results = [...this.results, ...data];
      this.page++;
    } finally {
      this.loading = false;
    }
  }

  onSearch() {
    this.loadReviews(true);
  }

  async loadMore(ev: any) {
    await this.loadReviews();
    ev.target.complete();
  }

  toggleFilters() {
  this.showFilters = !this.showFilters;
}


  applyFilters() {
    this.showFilters = false;
    this.loadReviews(true);
  }
  resetFilters() {
  this.postal = '';
  this.proj = '';
  this.minRating = null;
  this.loadReviews(true);
}
 openReviewDetails(homeownerName: any) {
  this.router.navigate(['/tabs/review-details', homeownerName]);
}
  
}
