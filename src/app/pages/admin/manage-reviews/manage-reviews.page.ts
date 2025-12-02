import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { supabase } from '../../../services/supabase.client';
import { ReviewService } from '../../../services/review.service';

@Component({
  standalone: false,
  selector: 'app-manage-reviews',
  templateUrl: './manage-reviews.page.html',
  styleUrls: ['./manage-reviews.page.scss']
})

export class ManageReviewsPage implements OnInit {

  // Filters
  q = '';          // Contractor Name
  postal = ''; 
  status = ''; 
  // Zip Code
  proj = '';       // Project Type
  minRating: number | null = null;

  reviews: any[] = [];
  services: any[] = [];
  loading = false;
  showFilters = true;

  constructor(private reviewService: ReviewService) {}

  async ngOnInit() {
    try {
      // Fetch available services for Project Type filter
      this.services = await this.reviewService.getServices();
    } catch (err) {
      console.error('Failed to load services:', err);
    }

    // Load reviews initially
    await this.loadReviews();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  async loadReviews() {
    this.loading = true;
    try {
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });

      // Apply filters
      if (this.q) query = query.ilike('homeowner_name', `%${this.q}%`);
      if (this.postal) query = query.eq('zip', this.postal);
	  if (this.status) query = query.eq('status', this.status);
      if (this.proj) query = query.eq('project_type', this.proj);
      if (this.minRating) query = query.gte('avg_score', this.minRating);

      const { data, error } = await query;
      if (error) throw error;

      this.reviews = data || [];
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      this.loading = false;
    }
  }

  async applyFilters() {
    this.showFilters = false;
    await this.loadReviews();
  }

  resetFilters() {
    this.q = '';
    this.postal = '';
	this.status = '';
    this.proj = '';
    this.minRating = null;
    this.showFilters = true;
    this.loadReviews();
  }

  async togglePublish(review: any) {
    try {
      const newStatus = review.status === 'published' ? 'pending' : 'published';
      await this.reviewService.updateReview(review.id, { status: newStatus });
      review.status = newStatus;
    } catch (err) {
      console.error('Error updating review status:', err);
    }
  }

  async deleteReview(reviewId: any) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await this.reviewService.deleteReview(reviewId);
      // Remove review locally
      this.reviews = this.reviews.filter(r => r.id !== reviewId);
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  }

}
