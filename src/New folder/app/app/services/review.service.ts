import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  async submitReview(review: any, attachments: File[]) {
    const { data, error } = await supabase.from('reviews').insert([review]).select().single();
    if (error) throw error;
    for (const file of attachments) {
      const path = `${data.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from('review-attachments').upload(path, file);
      if (upErr) throw upErr;
      const { error: linkErr } = await supabase.from('review_attachments').insert([{
        review_id: data.id,
        file_path: path,
        mime_type: file.type
      }]);
      if (linkErr) throw linkErr;
    }
    return data;
  }

  async myReviews(userId: string) {
    const { data, error } = await supabase.from('reviews')
      .select('*').eq('contractor_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
}
