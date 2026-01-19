import { Component, OnInit } from '@angular/core';
import { HomeownersService } from '../../services/homeowners.service';

@Component({
  standalone: false,
  selector: 'app-homeowners',
  templateUrl: './homeowners.page.html'
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

  constructor(private svc: HomeownersService) {}

  ngOnInit() {
    this.loadReviews(); // load all reviews on init
  }

  async loadReviews(reset = false) {
    if (reset) {
      this.page = 1;
      this.results = [];
      this.hasMore = true;
    }

    if (!this.hasMore) return;

    this.loading = true;
    this.error = '';
    try {
      const data = await this.svc.search(
        this.q,
        this.postal,
        this.proj,
        this.minRating ?? undefined,
        this.page,
        this.pageSize
      );

      if (data.length < this.pageSize) {
        this.hasMore = false;
      }

      this.results = [...this.results, ...data];
      this.page++;
    } catch (e: any) {
      this.error = e.message || 'Search failed';
    } finally {
      this.loading = false;
    }
  }

  async onSearch() {
    this.loadReviews(true); // reset and search
  }
}
