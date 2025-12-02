import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { supabase } from '../../../services/supabase.client';

@Component({
  standalone: false,
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
})
export class AdminDashboardPage implements OnInit {

  userRole: string | null = null;

  constructor(private router: Router) {}

  async ngOnInit() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const { data: contractor } = await supabase
      .from('contractors')
      .select('role')
      .eq('id', user.id)
      .single();

    this.userRole = contractor?.role ?? null;

    if (!['admin', 'superadmin'].includes(this.userRole!)) {
      this.router.navigate(['/']);
    }
  }

  goToManageUsers() {
    this.router.navigate(['/admin/manage-users']);
  }

  goToManageReviews() {
    this.router.navigate(['/admin/manage-reviews']);
  }

}
