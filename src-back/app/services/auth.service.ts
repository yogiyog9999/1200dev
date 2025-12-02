import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';
import { PushService } from '../services/push.service';

export interface ContractorProfile {
  id?: string; // equals auth user id
  business_name?: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  
  trade?: string;
  city?: string;
  zip?: string;
  state?: string;
  country?: string;
  license_number?: string;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserPreferences {
  user_id: string;
  hide_name: boolean;
  allow_push: boolean;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private pushService: PushService) {}

  // ---------- SIGN UP ----------
  async signUp(email: string, password: string, firstName: string, lastName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: 'myapp://auth/login',
      },
    });

    if (error) {
      if (error.message?.toLowerCase().includes('already registered') || error.code === 'user_already_exists') {
        throw new Error('This email is already registered. Please login instead.');
      }
      throw error;
    }

    return data;
  }

  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/auth/reset-password', 
     
    });

    if (error) throw error;
    return data;
  }
  // ---------- EMAIL VERIFICATION ----------
  async resendVerificationEmail(email: string) {
    return await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: 'myapp://auth/login',
      },
    });
  }

  // ---------- SIGN IN ----------
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const user = data.user;
    if (!user) throw new Error('No user found');

    if (!user.email_confirmed_at) {
      throw new Error('Email not verified. Please check your inbox.');
    }

    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('is_suspended')
      .eq('id', user.id)
      .single();

    if (contractorError) throw contractorError;

    if (contractor?.is_suspended) {
      await supabase.auth.signOut();
      throw new Error('Your account has been suspended. Please contact support.');
    }
	await this.pushService.init();

    return data;
  }

  // ---------- SIGN OUT ----------
  async signOut() {
    await supabase.auth.signOut();
  }

  // ---------- CURRENT USER ----------
  async currentUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }

  // ---------- CONTRACTOR PROFILE ----------
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('contractors')
      .select('*')
      .eq('id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
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

  async getContractorProfile(userId: string) {
    const { data, error } = await supabase
      .from('contractors')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  }

  async getContractorById(id: string) {
    const { data, error } = await supabase
      .from('contractors')
      .select('id, business_name, profile_image_url, first_name, last_name')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  // ---------- REVIEWS ----------
  async getContractorReviews(userId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('contractor_id', userId)
      .eq('status', 'published');
    if (error) throw error;
    return data;
  }

  async getAllReviews(homeownerName: any): Promise<any[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        homeowner_name,
        project_type,
        project_date,
        rating_overall,files,zip,comments, rating_payment, rating_communication, rating_scope, rating_change_orders, address,
        contractor_id,
        contractors (
          business_name, first_name, last_name,
          profile_image_url
        )
      `)
      .eq('id', homeownerName);

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
    return data || [];
  }

  // ---------- USER PREFERENCES ----------
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as UserPreferences | null;
  }

  async updatePreferences(userId: string, prefs: Partial<UserPreferences>) {
    const payload = { user_id: userId, updated_at: new Date().toISOString(), ...prefs };
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return data as UserPreferences;
  }
}
