import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';
import { PushService } from '../services/push.service';
import { AlertController, ToastController } from '@ionic/angular';
export interface ContractorProfile {
  id?: string; // equals auth user id
  business_name?: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string; 
  phone?:any
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
  constructor(private pushService: PushService,private alertController: AlertController,
  private toastController: ToastController) {}

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
        emailRedirectTo: 'https://dlistapp.net/email-confirmation.html',
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
      redirectTo: 'https://dlistapp.net/reset-password/'
    });
    if (error) throw error;
    return data;
  }

  async setSessionFromUrl(access_token: string, refresh_token: string) {
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token
    });
    if (error) throw error;
    return data;
  }

  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
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
async showToast(message: string) {
  const toast = await this.toastController.create({
    message,
    duration: 2500,
    position: "bottom",
  });
  toast.present();
}

  // ---------- SIGN IN ----------
  async signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  // Wrong login or other error → throw
  if (error && error.message !== "Email not confirmed") {
    throw error;
  }

  const user = data?.user;

  // User exists but email NOT verified → show popup
  if (error?.message === "Email not confirmed" || !user?.email_confirmed_at) {
    
    const alert = await this.alertController.create({
      header: "Email Not Verified",
      message: `Your email ${email} is not verified. Do you want to resend the verification link?`,
      buttons: [
        {
          text: "Resend Link",
          handler: async () => {
            await this.resendVerificationEmail(email);
          }
        },
        { text: "Cancel", role: "cancel" }
      ]
    });

    await alert.present();
    throw new Error("Email not verified");
  }

  // Check contractor suspension
  const { data: contractor } = await supabase
    .from("contractors")
    .select("is_suspended")
    .eq("id", user.id)
    .single();

  if (contractor?.is_suspended) {
    await supabase.auth.signOut();
    throw new Error("Account suspended");
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
      .select('id, business_name, profile_image_url, first_name, last_name, display_name')
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
  
  async getContractorlatestReviews(userId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('contractor_id', userId)
    .eq('status', 'published')
    .order('created_at', { ascending: false }) // newest first
    .limit(5); // only 5 rows

  if (error) throw error;
  return data;
}


  async getAllReviews(homeownerName: any): Promise<any[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        homeowner_name,state,city,
        project_type,homeowner_first_name,homeowner_last_name,project_date,rating_approach,rating_respect,rating_communication_style,rating_composure,rating_trust,rating_overall,files,zip,comments, rating_payment, rating_communication, rating_scope, rating_change_orders, address,
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
  
  
  async saveFcmToken(userId: string, token: string) {
  // Check if a token already exists for this user
  const { data: existing, error: fetchError } = await supabase
    .from('user_tokens')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    // PGRST116 = no record found
    throw fetchError;
  }

  if (existing) {
    // update existing token
    const { error: updateError } = await supabase
      .from('user_tokens')
      .update({
        fcm_token: token,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;
  } else {
    // insert new record
    const { error: insertError } = await supabase
      .from('user_tokens')
      .insert({
        user_id: userId,
        fcm_token: token,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (insertError) throw insertError;
  }

  console.log('✅ FCM token saved for user:', userId);
}
async removeFcmToken(userId: string) {
  const { error } = await supabase
    .from('user_tokens')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
  console.log('🔕 FCM token removed for user:', userId);
}

async checkAndCreatePreferences(userId: string) {
  // 1️⃣ Check if preferences exist
  const { data, error } = await supabase
    .from('user_preferences')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();   // 👈 safer

  if (error) {
    console.error('Preference check error:', error);
    return;
  }

  // 2️⃣ If no row → insert default
  if (!data) {
    const { error: insertError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        hide_name: true,
        allow_push: false
      });

    if (insertError) {
      console.error('Insert default preferences error:', insertError);
    } else {
      console.log('Default preferences inserted successfully');
    }
  } else {
    console.log('Preferences already exist');
  }
}


}
