import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { supabase } from '../../../services/supabase.client';
@Component({
  standalone: false,
  selector: 'app-manage-users',
  templateUrl: './manage-users.page.html',
  styleUrls: ['./manage-users.page.scss'],
})
export class ManageUsersPage implements OnInit {

  users: any[] = [];

  constructor() {}

  async ngOnInit() {
    const { data, error } = await supabase
      .from('contractors')
      .select('*');

    if (!error) this.users = data;
  }

  async promoteToAdmin(userId: string) {
    await supabase
      .from('contractors')
      .update({ role: 'admin' })
      .eq('id', userId);
    this.ngOnInit(); // refresh list
  }

}
