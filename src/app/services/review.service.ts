import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

@Injectable({ providedIn: 'root' })
export class ReviewService {
 async submitReview(review: any, attachments: File[] = []) {
  const { data, error } = await supabase.from('reviews').insert([review]).select().single();
  if (error) throw error;

  for (const file of attachments) {
    const path = `${data.id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from('profile-images').upload(path, file);
    if (upErr) throw upErr;

    const { error: linkErr } = await supabase.from('profile-images').insert([{
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
  async getServices() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  }
  
  // updateReview function
async updateReview(id: string, updates: any) {
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select('*'); // explicitly select all columns

  if (error) throw error;

  if (!data || data.length === 0) {
    console.warn('No row updated');
    return null;
  }

  return data[0];
}



async deleteReview(reviewId: number) {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) throw error;
  return true;
}

async getStates() {
  const { data, error } = await supabase
    .from('states')
    .select('code, name, enabled')
    .order('name', { ascending: true });

  if (error) throw error;

  // Filter enabled
  return data?.filter((s: any) => s.enabled) || [];
}

async getUserReviewCount(userId: string) {
  //console.log('Debug: getUserReviewCount called for userId:', userId);

  const { data, error, count } = await supabase
  .from('reviews')
  .select('*', { count: 'exact' }) // get exact count
  .eq('contractor_id', userId)
  .eq('status', 'published');

  if (error) {
    //console.error('Supabase error fetching review count:', error);
    throw error;
  }

  //console.log('Debug: Supabase returned count:', count);
  //console.log('Debug: Supabase returned data:', data);

  return count || 0;
}

async fetchUserBadge(userId: string) {
  const reviewCount = await this.getUserReviewCount(userId);
  console.log('Debug: User review count:', reviewCount);

  // Fetch badges
  const { data: badges, error } = await supabase
    .from('review_badges')
    .select('*')
    .order('min_reviews', { ascending: true });

  if (error) {
     throw error;
  }

  

  // Find badge for current review count
  const badge = badges?.find(
    b => reviewCount >= b.min_reviews && reviewCount <= b.max_reviews
  );

  

  return badge;
}




}
