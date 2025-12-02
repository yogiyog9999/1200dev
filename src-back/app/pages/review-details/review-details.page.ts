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
  reviews: any[] = [];
  homeowner: { name: string; address: string;project_type:any;project_date:any; zip:any;rating_overall:any;comments:any,files:any} | null = null;
  overallAvg: string | null = null;
   hideNameOnReviews = false;
  allowPushNotifications = false;
  currentUserId: string | null = null;
  constructor(
    private route: ActivatedRoute,
    private auth: AuthService
  ) {}

  async ngOnInit() {
  
  
  


  
    const user = await this.auth.currentUser();
  if (user) {
    this.currentUserId = user.id;
    const prefs = await this.auth.getPreferences(user.id);
    this.hideNameOnReviews = prefs?.hide_name ?? false;
    this.allowPushNotifications = prefs?.allow_push ?? false;
  }

    
    const homeownerName = this.route.snapshot.paramMap.get('homeownerName') || '';

    // Fetch reviews for this homeowner
    this.reviews = await this.auth.getAllReviews(homeownerName);

    // Fetch contractor names + compute avg per review
    for (let review of this.reviews) {
      const contractor = await this.auth.getContractorById(review.contractor_id);
      review.contractor_name = contractor?.business_name || 'Unknown Contractor';
      review.profile_image_url = contractor?.profile_image_url || 'assets/logo.png';
	  review.first_name = contractor?.first_name || '';
      review.last_name = contractor?.last_name || '';
      // Compute avg score from ratings
      const ratings = [
        review.rating_payment,
        review.rating_communication,
        review.rating_scope,
        review.rating_change_orders,
        review.rating_overall
      ].map(Number).filter(n => !isNaN(n));

      review.avg_score = ratings.length
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : null;
    }

    
    if (this.reviews.length > 0) {
      this.homeowner = {
        name: this.reviews[0].homeowner_name,
        address: this.reviews[0].address,
		project_type: this.reviews[0].project_type,
		project_date: this.reviews[0].project_date,
		zip: this.reviews[0].zip,
		rating_overall: this.reviews[0].rating_overall,
		comments: this.reviews[0].comments,
		files: this.reviews[0].files
      };
    }

    // compute overall average across all reviews
    const allRatings: number[] = [];
    this.reviews.forEach(r => {
      const ratings = [
        r.rating_payment,
        r.rating_communication,
        r.rating_scope,
        r.rating_change_orders,
        r.rating_overall
      ].map(Number).filter(n => !isNaN(n));
      allRatings.push(...ratings);
    });

    this.overallAvg = allRatings.length
      ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
      : null;
  }
  
  getFileIcon(url: string): string {
  if (!url) return 'document-outline';
  const ext = url.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'pdf':
      return 'document-text-outline';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return 'image-outline';
    case 'doc':
    case 'docx':
      return 'document-outline';
    case 'xls':
    case 'xlsx':
      return 'document-outline';
    case 'mp4':
    case 'mov':
    case 'avi':
      return 'videocam-outline';
    default:
      return 'document-outline';
  }
}

getFileName(url: string): string {
  try {
    return url.split('/').pop() || url;
  } catch {
    return url;
  }
}



isImage(file: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
}

openPreview(file: string) {
  this.previewImage = file;
}

closePreview() {
  this.previewImage = null;
}

getFileNames(file: string): string {
  return file.split('/').pop() || file;
}

getFileIcons(file: string): string {
  if (/\.(pdf)$/i.test(file)) return 'document-text-outline';
  if (/\.(doc|docx)$/i.test(file)) return 'document-outline';
  if (/\.(xls|xlsx)$/i.test(file)) return 'document-attach-outline';
  return 'attach-outline';
}

}
