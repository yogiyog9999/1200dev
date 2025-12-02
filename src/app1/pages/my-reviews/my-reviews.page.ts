import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-my-reviews',
  templateUrl: './my-reviews.page.html',
  styleUrls: ['./my-reviews.page.scss'],
  standalone: false,
})
export class MyReviewsPage implements OnInit {
  reviews: any[] = [];

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    const s = await this.supabase.getSession();
    const contractorId = s?.user?.id;
    if (!contractorId) return;

    const { data } = await this.supabase.client
      .from('reviews')
      .select('*')
      .eq('contractor_id', contractorId);

    this.reviews = data || [];
  }
}
