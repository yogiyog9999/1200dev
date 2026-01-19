import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit {
  reviews: any[] = [];
  avgOverall = 0;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    const s = await this.supabase.getSession();
    const contractorId = s?.user?.id;
    if (!contractorId) return;

    const { data, error } = await this.supabase.client
      .from('reviews')
      .select('*')
      .eq('contractor_id', contractorId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      this.reviews = data;
      if (data.length) {
        this.avgOverall =
          data.reduce((sum: any, r: any) => sum + (r.overall || 0), 0) /
          data.length;
      }
    }
  }
}
