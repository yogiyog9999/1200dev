import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';

@Component({
  standalone: false, // not standalone, so it can be declared in an NgModule
  selector: 'app-admin-flagged',
  templateUrl: './admin-flagged.page.html'
})
export class AdminFlaggedPage implements OnInit {
  flagged: any[] = [];
  loading = false;
  error = '';

  constructor(private admin: AdminService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    this.error = '';
    try {
      this.flagged = await this.admin.flagged();
    } catch (e: any) {
      this.error = e.message || 'Failed to load';
    } finally {
      this.loading = false;
    }
  }

  async publish(id: string) {
    await this.admin.setStatus(id, 'published');
    await this.load();
  }

  async remove(id: string) {
    await this.admin.setStatus(id, 'removed');
    await this.load();
  }
}
