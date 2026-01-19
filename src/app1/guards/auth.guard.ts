import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
@Injectable({providedIn:'root'})
export class AuthGuard implements CanActivate{
  constructor(private supa:SupabaseService, private router:Router){}
  async canActivate(){ const s=await this.supa.getSession(); if(!s){ this.router.navigateByUrl('/login'); return false;} return true; }
}