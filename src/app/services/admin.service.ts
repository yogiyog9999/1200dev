import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

@Injectable({ providedIn: 'root' })
export class AdminService {
  async flagged() {
    const { data, error } = await supabase.rpc('get_flagged_reviews');
    if (error) throw error;
    return data;
  }
  async setStatus(reviewId: string, status: 'published'|'removed') {
    const { error } = await supabase.rpc('admin_update_review_status', { p_review_id: reviewId, p_status: status });
    if (error) throw error;
  }
}
