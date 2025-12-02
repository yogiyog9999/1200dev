import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  form: FormGroup;
  userId: string | undefined;

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService
  ) {
    this.form = this.fb.group({
      business_name: [''],
      trade: [''],
      location: [''],
      license_number: ['']
    });
  }

  async ngOnInit() {
    const s = await this.supabase.getSession();
    this.userId = s?.user?.id;
    if (!this.userId) return;

    const { data } = await this.supabase.client
      .from('contractors')
      .select('*')
      .eq('id', this.userId)
      .single();

    if (data) {
      this.form.patchValue(data);
    }
  }

  async save() {
    if (!this.userId) return;

    const { error } = await this.supabase.client
      .from('contractors')
      .update(this.form.value)
      .eq('id', this.userId);

    if (error) {
      alert(error.message);
    } else {
      alert('Saved');
    }
  }

  async logout() {
    await this.supabase.signOut();
    location.href = '/login';
  }
}
