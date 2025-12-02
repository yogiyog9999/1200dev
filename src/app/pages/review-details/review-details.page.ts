import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-review-details',
  templateUrl: './review-details.page.html',
  styleUrls: ['./review-details.page.scss']
})
export class ReviewDetailsPage implements OnInit {

  previewImage: string | null = null;
  previewVideo: string | null = null;

  reviews: any[] = [];
  homeowner: any = null;
  overallAvg: string | null = null;

  currentUserId: string | null = null;

  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService
  ) {}

  // Runs once on page create
  async ngOnInit() {
    const user = await this.auth.currentUser();
    this.currentUserId = user?.id || null;
  }

  // Runs EVERY TIME page is entered (perfect for live updates)
  async ionViewWillEnter() {
    await this.loadReviewDetails();
  }

  // MASTER LOADER FUNCTION (optimized)
  private async loadReviewDetails() {
  this.isLoading = true;

  try {
    const homeownerName = this.route.snapshot.paramMap.get('homeownerName') || '';

    // Fetch reviews
    this.reviews = await this.auth.getAllReviews(homeownerName);

    if (this.reviews.length === 0) {
      this.isLoading = false;
      return;
    }

    // Extract contractor IDs (unique)
    const contractorIds = [...new Set(this.reviews.map(r => r.contractor_id))];

    // Parallel fetch contractors + preferences
    const contractorPromises = contractorIds.map(id => this.auth.getContractorById(id));
    const preferencePromises = contractorIds.map(id => this.auth.getPreferences(id));

    const contractors = await Promise.all(contractorPromises);
    const preferences = await Promise.all(preferencePromises);

    // Convert to lookup maps
    const contractorMap: { [key: string]: any } = {};
    const prefsMap: { [key: string]: any } = {};

    contractors.forEach(c => {
      if (c) contractorMap[c.id] = c;
    });

    preferences.forEach(p => {
      if (p) prefsMap[p.user_id] = p;
    });

    // Enrich reviews
    this.reviews = this.reviews.map(review => {
      const contractor = contractorMap[review.contractor_id] || {};
      const pref = prefsMap[review.contractor_id] || {
        hide_name: false,
        allow_push: true
      };

      // Hide name logic
      review.hide_name = pref.hide_name;
      review.display_name = pref.hide_name ? "Anonymous User" : contractor.display_name;
      review.profile_image_url = pref.hide_name ? "assets/anon.png" : contractor.profile_image_url;

      // Ratings logic
      let ratings: number[] = [];

      if (review.project_type === 'Social Interaction' || review.project_type === 'Social') {
        ratings = [
          Number(review.rating_approach ?? 0),
          Number(review.rating_respect ?? 0),
          Number(review.rating_communication_style ?? 0),
          Number(review.rating_composure ?? 0),
          Number(review.rating_trust ?? 0)
        ].filter(n => n > 0);
      } else {
        ratings = [
          Number(review.rating_payment ?? 0),
          Number(review.rating_communication ?? 0),
          Number(review.rating_scope ?? 0),
          Number(review.rating_change_orders ?? 0),
          Number(review.rating_overall ?? 0)
        ].filter(n => n > 0);
      }

      review.avg_score = ratings.length
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : null;

      return review;
    });

    // Homeowner info
    const r = this.reviews[0];
    this.homeowner = {
      first_name: r.homeowner_first_name,
      last_name: r.homeowner_last_name,
      email: r.homeowner_email,
      phone: r.homeowner_phone,
      address: r.address,
      city: r.city,
      state: r.state,
      zip: r.zip,
      project_type: r.project_type,
      project_date: r.project_date,
      comments: r.comments,
      files: r.files
    };

    // Global average
    const allRatings: number[] = [];

    this.reviews.forEach(rv => {
      const list = rv.project_type === 'Social Interaction' || rv.project_type === 'Social'
        ? [
            Number(rv.rating_approach ?? 0),
            Number(rv.rating_respect ?? 0),
            Number(rv.rating_communication_style ?? 0),
            Number(rv.rating_composure ?? 0),
            Number(rv.rating_trust ?? 0)
          ]
        : [
            Number(rv.rating_payment ?? 0),
            Number(rv.rating_communication ?? 0),
            Number(rv.rating_scope ?? 0),
            Number(rv.rating_change_orders ?? 0),
            Number(rv.rating_overall ?? 0)
          ];

      list.filter(n => n > 0).forEach(n => allRatings.push(n));
    });

    this.overallAvg = allRatings.length
      ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
      : null;

  } catch (err) {
    console.error('Error loading review details:', err);
  }

  this.isLoading = false;
}


  // FILE HELPERS =============================

  getFileIcon(url: string): string {
    const ext = url.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'pdf': return 'document-text-outline';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp': return 'image-outline';
      case 'doc':
      case 'docx':
      case 'xls':
      case 'xlsx': return 'document-outline';
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
      case 'webm': return 'videocam-outline';
      default: return 'document-outline';
    }
  }

  getFileName(url: string): string {
    return url.split('/').pop() || url;
  }

  // IMAGE PREVIEW
  openPreview(file: string) {
    this.previewImage = file;
  }
  closePreview() {
    this.previewImage = null;
  }

  // VIDEO PREVIEW
  isImage(file: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
  }
  isVideo(file: string): boolean {
    return /\.(mp4|mov|avi|mkv|webm)$/i.test(file);
  }
  openVideo(file: string) {
    this.previewVideo = file;
  }
  closeVideo() {
    this.previewVideo = null;
  }

}
