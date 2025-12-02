import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HomeownersService } from '../../services/homeowners.service';
import { Router } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import * as L from 'leaflet';
import 'leaflet.markercluster';

// 🛠 Fix Leaflet icon paths for Ionic
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});

@Component({
standalone: false,
  selector: 'app-homeowners',
  templateUrl: './homeowners.page.html',
  styleUrls: ['./homeowners.page.scss'],
})
export class HomeownersPage implements OnInit, AfterViewInit {
  q = '';
  postal = '';
  proj = '';
  minRating: number | null = null;

  results: any[] = [];
  loading = false;
  page = 1;
  pageSize = 10;
  hasMore = true;

  showFilters = true;
  services: any[] = [];

  viewMode: 'list' | 'map' = 'list';

  map!: L.Map;
  markerCluster!: L.MarkerClusterGroup;
  markers: L.Marker[] = [];

  mapLoading = false;

  constructor(
    private svc: HomeownersService,
    private router: Router,
    private reviewSvc: ReviewService
  ) {}

  async ngOnInit() {
    try {
      this.services = await this.reviewSvc.getServices();
    } catch (err) {
      console.error('Failed to load services:', err);
    }
    this.loadReviews(true);
  }
  async onViewModeChange() {
  if (this.viewMode === 'map') {
    const container = document.getElementById('reviewMap');
    if (!container) return;

    // Initialize map only once
    if (!this.map) {
      this.map = L.map('reviewMap', {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);

      this.markerCluster = L.markerClusterGroup();
      this.map.addLayer(this.markerCluster);
    }

    // Wait for the container to be visible before invalidating size
    await new Promise((resolve) => setTimeout(resolve, 200)); // small delay
    this.map.invalidateSize();

    // Load markers
    this.loadMapMarkers();
  }
}


  async ngAfterViewInit() {
    const container = document.getElementById('reviewMap');
    if (!container) return;

    // Initialize map
    this.map = L.map('reviewMap', {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.markerCluster = L.markerClusterGroup();
    this.map.addLayer(this.markerCluster);
  }

  async loadReviews(reset = false) {
    if (reset) {
      this.page = 1;
      this.results = [];
      this.hasMore = true;
    }
    if (!this.hasMore) return;

    this.loading = true;
    try {
      const data = await this.svc.search(
        this.q,
        this.postal,
        this.proj,
        this.minRating ?? undefined,
        this.page,
        this.pageSize
      );

      if (data.length < this.pageSize) this.hasMore = false;
      this.results = [...this.results, ...data];
      this.page++;

      if (this.viewMode === 'map') {
        setTimeout(() => this.loadMapMarkers(), 100); // faster
      }
    } finally {
      this.loading = false;
    }
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  applyFilters() {
    this.showFilters = false;
    this.loadReviews(true);
  }

  resetFilters() {
    this.q = '';
    this.postal = '';
    this.proj = '';
    this.minRating = null;
    this.showFilters = true;
    this.loadReviews(true);
  }

  openReviewDetails(id: any) {
    this.router.navigate(['/tabs/review-details', id]);
  }

  // Load map markers using lat/lng if available
  async loadMapMarkers() {
    if (!this.map || !this.results.length) return;
    this.mapLoading = true;

    // Clear previous markers
    if (this.markerCluster) {
      this.map.removeLayer(this.markerCluster);
    }
    this.markerCluster = L.markerClusterGroup();
    this.markers = [];

    for (const r of this.results) {
      // Skip if no lat/lng
      if (!r.lat || !r.lng) continue;

      const marker = L.marker([r.lat, r.lng]);

      const popupContent = `
        <div class="popup-card">
          <h4 class="popup-hname">${r.homeowner_name || 'Homeowner'}</h4>
          <p><strong>Project Type:</strong> ${r.project_type || ''}</p>
          <p>Latest review posted on ${
            r.project_date ? new Date(r.project_date).toLocaleDateString() : ''
          }</p>
          <div class="popup-stars">
            ${[1, 2, 3, 4, 5]
              .map(star => `
                <ion-icon name="${
                  star <= r.avg_score
                    ? 'star'
                    : star - 0.5 <= r.avg_score
                    ? 'star-half'
                    : 'star-outline'
                }" color="warning"></ion-icon>
              `).join('')}
            <span>${r.avg_score}/5</span>
          </div>
          <a href="#" class="popup-link" id="open-${r.id}">View Reviews</a>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const link = document.getElementById(`open-${r.id}`);
        if (link) {
          link.onclick = (e) => {
            e.preventDefault();
            this.openReviewDetails(r.id);
          };
        }
      });

      this.markerCluster.addLayer(marker);
      this.markers.push(marker);
    }

    this.map.addLayer(this.markerCluster);

    // Fit map bounds if we have markers
    if (this.markers.length) {
      const group = L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }

    this.mapLoading = false;
  }
  async loadMore(event?: any) {
  await this.loadReviews(false);
  if (event) {
    event.target.complete();
  }
}

}
