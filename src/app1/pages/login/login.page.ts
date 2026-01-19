import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private supa: SupabaseService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async submit() {
    if (this.form.invalid) return;

    try {
      await this.supa.signIn(this.form.value.email, this.form.value.password);
      this.router.navigateByUrl('/dashboard');
    } catch (e: any) {
      alert(e.message || 'Login failed');
    }
  }
}
