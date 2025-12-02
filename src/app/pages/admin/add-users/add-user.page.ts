import { Component } from '@angular/core';
import { supabase } from '../../../services/supabase.client';

@Component({
  standalone: false,
  selector: 'app-add-user',
  templateUrl: './add-user.page.html',
  styleUrls: ['./add-user.page.scss']
})

export class AddUserPage {

  name = '';
  email = '';
  password = '';
  role: 'admin' | 'superadmin' | '' = '';

  error = '';
  success = '';

  constructor() {}

  async addUser() {
    this.error = '';
    this.success = '';

    if (!this.name || !this.email || !this.password || !this.role) {
      this.error = 'All fields are required';
      return;
    }

    try {
      // 1️⃣ Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: this.email,
        password: this.password,
        email_confirm: true // auto-confirm email
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('Failed to get new user ID');

      // 2️⃣ Insert role and profile info in contractors table
      const { data, error } = await supabase.from('contractors').insert([{
        user_id: userId,
        full_name: this.name,
        role: this.role
      }]).select().single();

      if (error) throw error;

      this.success = `User ${data.full_name} added successfully!`;

      // Reset fields
      this.name = '';
      this.email = '';
      this.password = '';
      this.role = '';

    } catch (err: any) {
      console.error(err);
      this.error = err.message || 'Failed to add user';
    }
  }
}