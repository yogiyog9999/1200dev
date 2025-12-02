import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private supa: SupabaseService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      business_name: ['', Validators.required],
      trade: ['', Validators.required],
      location: ['', Validators.required],
      license_number: ['']
    });
  }

  async submit() {
    if (this.form.invalid) return;

    try {
      const profile = {
        business_name: this.form.value.business_name,
        trade: this.form.value.trade,
        location: this.form.value.location,
        license_number: this.form.value.license_number
      };

      await this.supa.signUp(
        this.form.value.email,
        this.form.value.password,
        profile
      );

      alert('Check email to confirm.');
      this.router.navigateByUrl('/login');
    } catch (e: any) {
      alert(e.message || 'Registration failed');
    }
  }
}
