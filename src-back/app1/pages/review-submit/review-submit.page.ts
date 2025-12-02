import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-review-submit',
  templateUrl: './review-submit.page.html',
  styleUrls: ['./review-submit.page.scss'],
  standalone: false,
})
export class ReviewSubmitPage {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private router: Router
  ) {
    this.form = this.fb.group({
      homeowner_name: ['', Validators.required],
      address: ['', Validators.required],
      project_type: ['', Validators.required],
      project_date: ['', Validators.required],
      payment_timeliness: [3, Validators.required],
      communication: [3, Validators.required],
      scope_clarity: [3, Validators.required],
      change_order_fairness: [3, Validators.required],
      overall: [3, Validators.required],
      comments: ['']
    });
  }

  async submit() {
    if (this.form.invalid) return;

    const s = await this.supabase.getSession();
    const contractorId = s?.user?.id;

    if (!contractorId) {
      alert('Not logged in');
      return;
    }

    const payload = { ...this.form.value, contractor_id: contractorId };
    const { error } = await this.supabase.client.from('reviews').insert([payload]);

    if (error) {
      alert(error.message);
      return;
    }

    alert('Review submitted!');
    this.router.navigateByUrl('/dashboard');
  }
}
