import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
@Injectable({providedIn:'root'})
export class SupabaseService {
  client: SupabaseClient;
  constructor(){ this.client=createClient(environment.supabaseUrl, environment.supabaseKey); }
  async signIn(email:string,password:string){ const {data,error}=await this.client.auth.signInWithPassword({email,password}); if(error) throw error; return data; }
  async signUp(email:string,password:string,profile:any){ const {data,error}=await this.client.auth.signUp({email,password}); if(error) throw error; const id=data.user?.id; if(id){ await this.client.from('contractors').insert([{id,...profile}]); } return data; }
  async getSession():Promise<Session|null>{ const {data}=await this.client.auth.getSession(); return data.session; }
  async signOut(){ await this.client.auth.signOut(); }
}