import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-logout',
  template: '<ion-content class="ion-padding"><p>Signing out...</p></ion-content>'
})
export class LogoutPage {
  constructor(private auth: AuthService, private router: Router) {
    this.doLogout();
  }

  async doLogout() {
    await this.auth.signOut();
    this.router.navigate(['/login']);
  }
}
