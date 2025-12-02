import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

@Injectable({ providedIn: 'root' })
export class HomeownersService {
  async search(
    term: string,
    postal?: string,
    projectType?: string,
    minRating?: number,
    page: number = 1,
    pageSize: number = 10
  ) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    
  let query = supabase
  .rpc('search_reviews', {
    search_text: term?.trim() || null,
    proj_type: projectType || null,
    min_avg_score: minRating ?? null,
    postal_code: postal?.trim() || null
  })
  .range(from, to);

  
console.log('Supabase request:', query);

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async profile(id: string) {
    const { data, error } = await supabase.rpc('get_homeowner_profile', { homeowner_uuid: id });
    if (error) throw error;
    return data;
  }
}
