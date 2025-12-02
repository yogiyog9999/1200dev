import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { supabase } from '../../services/supabase.client';

@Component({
  standalone: false,
  selector: 'app-verify-email',
  templateUrl: './verify-email.page.html',
  styleUrls: ['./verify-email.page.scss']
})
export class VerifyEmailPage implements OnInit {
  status: 'checking' | 'verified' | 'failed' = 'checking';

  constructor(private router: Router) {}

  async ngOnInit() {
    // When the user clicks the email link, Supabase may include a hash with access_token type params.
    // Exchange any code present in URL for a session (handles email confirmation deep links).
    try {
      const url = new URL(window.location.href);
      const hasCode = url.searchParams.get('code') || url.hash.includes('access_token');
      if (hasCode) {
        // Supabase auto-handles if there's a code in the URL via this helper:
        const { data, error } = await supabase.auth.getSession();
        if (!data.session) {
          // Try to recover session from URL
          // No direct API needed; supabase-js v2 automatically parses on page load for email links.
        }
      }
      // After a short delay, check auth state
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        this.status = 'verified';
        setTimeout(() => this.router.navigateByUrl('/tabs/profile'), 1200);
      } else {
        this.status = 'failed';
      }
    } catch {
      this.status = 'failed';
    }
  }

  goLogin() { this.router.navigateByUrl('/login'); }
}
