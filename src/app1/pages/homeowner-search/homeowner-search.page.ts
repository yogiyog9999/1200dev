import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-homeowner-search',
  templateUrl: './homeowner-search.page.html',
  styleUrls: ['./homeowner-search.page.scss'],
  standalone: false,
})
export class HomeownerSearchPage {
  filters: any = { name: '', zip: '', project_type: '', min_rating: 1 };
  results: any[] = [];

  constructor(private supabase: SupabaseService) {}

  async search() {
    let q = this.supabase.client.from('reviews').select('*');
    if (this.filters.name) q = q.ilike('homeowner_name', `%${this.filters.name}%`);
    if (this.filters.zip) q = q.ilike('address', `%${this.filters.zip}%`);
    if (this.filters.project_type) q = q.eq('project_type', this.filters.project_type);

    const { data, error } = await q
      .gte('overall', this.filters.min_rating)
      .order('created_at', { ascending: false });

    if (!error && data) this.results = data;
  }
}
