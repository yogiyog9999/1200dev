import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Signup and create contractor profile
  async signUpContractor(email: string, password: string, profile: any) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    const user = data.user;
    if (!user) throw new Error('User signup failed: no user returned');

     return { user, session: data.session };
  }

  // Login
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data; // returns { user, session }
  }

  // Logout
  async signOut() {
    await supabase.auth.signOut();
  }

  // Current logged in user
  async currentUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }

  // ✅ Get contractor profile
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('contractors')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // ✅ Update contractor profile
  async updateProfile(userId: string, profile: any) {
    const { error } = await supabase
      .from('contractors')
      .update(profile)
      .eq('id', userId);

    if (error) throw error;
    return true;
  }
}
