import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html'
})
export class DashboardPage implements OnInit {
  me: any = null;

  constructor(private auth: AuthService) {}

  async ngOnInit() {
    this.me = await this.auth.currentUser();
  }
}
