import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

export interface ContractorProfile {
  id?: string; // equals auth user id
  business_name?: string;
  trade?: string;
  city?: string;
  state?: string;
  country?: string;
  license_number?: string;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'http://localhost:8100/login',
      },
    });
    if (error) throw error;
    return data; // { user, session }
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const user = data.user;
    if (!user) throw new Error('No user found');
    if (!user.email_confirmed_at) {
      throw new Error('Email not verified. Please check your inbox.');
    }
    return data; // { user, session }
  }

  async signOut() {
    await supabase.auth.signOut();
  }

  async currentUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('contractors')
      .select('*')
      .eq('id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116: No rows
    return data as ContractorProfile | null;
  }

  async upsertProfile(userId: string, profile: ContractorProfile) {
    const payload = { id: userId, ...profile, updated_at: new Date().toISOString() };
    const { data, error } = await supabase
      .from('contractors')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data as ContractorProfile;
  }
}
