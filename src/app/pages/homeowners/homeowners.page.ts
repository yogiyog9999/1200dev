import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HomeownersService } from '../../services/homeowners.service';
import { Router } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import * as L from 'leaflet';

// Fix Leaflet icon paths for Ionic
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
  filteredResults: any[] = [];
  loading = false;
  page = 1;
  pageSize = 10;
  hasMore = true;

  showFilters = true;
  services: any[] = [];

  viewMode: 'list' | 'map' = 'list';

  map!: L.Map;
  markers: L.Marker[] = [];
  mapLoading = false;

  currentStateMode: string | null = null; // which state is being viewed

  // Predefined state centers
  stateCenters: Record<string, { lat: number; lng: number }> = {
    Alabama: { lat: 32.806671, lng: -86.79113 },
    Alaska: { lat: 61.370716, lng: -152.404419 },
    Arizona: { lat: 33.729759, lng: -111.431221 },
    Arkansas: { lat: 34.969704, lng: -92.373123 },
    California: { lat: 36.778259, lng: -119.417931 },
    Colorado: { lat: 39.550051, lng: -105.782067 },
    Connecticut: { lat: 41.603221, lng: -73.087749 },
    Delaware: { lat: 39.318523, lng: -75.507141 },
    Florida: { lat: 27.994402, lng: -81.760254 },
    Georgia: { lat: 32.165623, lng: -82.900078 },
    Hawaii: { lat: 21.094318, lng: -157.498337 },
    Idaho: { lat: 44.068203, lng: -114.742043 },
    Illinois: { lat: 40.633125, lng: -89.398528 },
    Indiana: { lat: 40.551217, lng: -85.602364 },
    Iowa: { lat: 41.878003, lng: -93.097702 },
    Kansas: { lat: 39.011902, lng: -98.484246 },
    Kentucky: { lat: 37.839333, lng: -84.270018 },
    Louisiana: { lat: 30.984297, lng: -91.962333 },
    Maine: { lat: 45.253783, lng: -69.445469 },
    Maryland: { lat: 39.045753, lng: -76.641273 },
    Massachusetts: { lat: 42.407211, lng: -71.382437 },
    Michigan: { lat: 44.182205, lng: -84.506836 },
    Minnesota: { lat: 46.729553, lng: -94.6859 },
    Mississippi: { lat: 32.354668, lng: -89.398528 },
    Missouri: { lat: 37.964253, lng: -91.831833 },
    Montana: { lat: 46.879682, lng: -110.362566 },
    Nebraska: { lat: 41.492537, lng: -99.901813 },
    Nevada: { lat: 38.80261, lng: -116.419389 },
    NewHampshire: { lat: 43.193852, lng: -71.572395 },
    NewJersey: { lat: 40.058324, lng: -74.405661 },
    NewMexico: { lat: 34.97273, lng: -105.032363 },
    NewYork: { lat: 43.299428, lng: -74.217933 },
    NorthCarolina: { lat: 35.759573, lng: -79.0193 },
    NorthDakota: { lat: 47.551493, lng: -101.002012 },
    Ohio: { lat: 40.417287, lng: -82.907123 },
    Oklahoma: { lat: 35.007752, lng: -97.092877 },
    Oregon: { lat: 43.804133, lng: -120.554201 },
    Pennsylvania: { lat: 41.203322, lng: -77.194525 },
    RhodeIsland: { lat: 41.580095, lng: -71.477429 },
    SouthCarolina: { lat: 33.836081, lng: -81.163725 },
    SouthDakota: { lat: 44.299782, lng: -99.438828 },
    Tennessee: { lat: 35.517491, lng: -86.580447 },
    Texas: { lat: 31.968599, lng: -99.90181 },
    Utah: { lat: 39.32098, lng: -111.093731 },
    Vermont: { lat: 44.558803, lng: -72.577841 },
    Virginia: { lat: 37.431573, lng: -78.656894 },
    Washington: { lat: 47.751074, lng: -120.740139 },
    WestVirginia: { lat: 38.597626, lng: -80.454903 },
    Wisconsin: { lat: 44.268543, lng: -89.616508 },
    Wyoming: { lat: 42.755966, lng: -107.30249 },
  };

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

    await this.loadReviews(true);
  }

  ngAfterViewInit() {
    const container = document.getElementById('reviewMap');
    if (!container) return;
    this.initMap();
  }

  async onViewModeChange() {
  const container = document.getElementById('reviewMap');
  if (!container) return;

  if (this.viewMode === 'map') {
    // ✅ If map exists already, remove it before reinitializing
    if (this.map) {
      this.map.remove();
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    this.initMap(); // reinitialize fresh map
  } else {
    // When switching back to list, clean up map to save memory
    if (this.map) {
      this.map.remove();
      this.map = undefined as any;
    }
  }
}


  /** Initialize map centered on USA */
  initMap() {
    this.map = L.map('reviewMap', {
      center: [37.8, -96.9],
      zoom: 4,
      zoomControl: true,
      attributionControl: false,
      maxBounds: [
        [7, -170], // SW corner (limit dragging)
        [72, -50], // NE corner
      ],
      maxBoundsViscosity: 1.0,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    //this.addBackButton(); // Add reset button
    this.loadMarkers();
  }

  /** Add “Back to USA View” button */
  

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

  async loadReviews(reset = false) {
    if (reset) {
      this.page = 1;
      this.results = [];
      this.filteredResults = [];
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
      this.filteredResults = [...this.results];
      this.page++;

      if (this.viewMode === 'map') {
        setTimeout(() => this.loadMarkers(), 100);
      }
    } finally {
      this.loading = false;
    }
  }

  async loadMore(event?: any) {
    await this.loadReviews(false);
    if (event) event.target.complete();
  }

  /** Reset to all-state mode */
  resetStateMode() {
    this.currentStateMode = null;
    this.map.setView([37.8, -96.9], 4);
    this.loadMarkers();
    this.filteredResults = [...this.results];
  }

  /** Load one marker per state */
  async loadMarkers() {
    if (!this.map) return;
    this.mapLoading = true;

    // Remove old markers
    if (this.markers.length) {
      this.markers.forEach((m) => this.map.removeLayer(m));
      this.markers = [];
    }

    const stateMap: Record<string, number> = {};
    this.results.forEach((r) => {
      if (!r.state) return;
      stateMap[r.state] = (stateMap[r.state] || 0) + 1;
    });

    for (const [state, count] of Object.entries(stateMap)) {
      const key = state.replace(/\s+/g, ''); // Remove spaces
const coord = this.stateCenters[key];
      if (!coord) continue;

      const marker = L.marker([coord.lat, coord.lng], {
        icon: L.divIcon({
          className: 'state-marker',
          html: `<div class="state-marker">
                   <div style="width: 30px;height: 30px;margin-left: 5px;padding-top: 5px;text-align: center;border-radius: 15px;color: #fff;
background: #ef6229;">${count}</div>
                   <div style="color: #000;width: fit-content;">${state}</div>
                 </div>`,
          iconSize: [50, 50],
          iconAnchor: [25, 25],
        }),
      });

      marker.on('click', () => {
        this.currentStateMode = state;
        this.map.setView([coord.lat, coord.lng], 6);
        this.showStateMarkers(state);
      });

      marker.addTo(this.map);
      this.markers.push(marker);
    }

    this.mapLoading = false;
  }

  /** Show individual review markers for one state */
  showStateMarkers(state: string) {
    this.markers.forEach((m) => this.map.removeLayer(m));
    this.markers = [];

    const stateResults = this.results.filter((r) => r.state === state);

    for (const r of stateResults) {
      if (!r.lat || !r.lng) continue;

      const marker = L.marker([r.lat, r.lng]);
      const popupContent = `
        <div class="popup-card">
          <h4 class="popup-hname">${r.homeowner_first_name || ''} ${r.homeowner_last_name || ''}</h4>
          <p><strong>Type of Interaction:</strong> ${r.project_type || ''}</p>
		  <p><strong>Address:</strong> ${r.address || ''}</p>
		  <p><strong>State:</strong> ${r.state || ''}</p>
		  <p><strong>City:</strong> ${r.city || ''}</p>
          <p>Date of Interaction ${
            r.project_date
              ? new Date(r.project_date).toLocaleDateString()
              : ''
          }</p>
          <div class="popup-stars">
            ${[1, 2, 3, 4, 5]
              .map(
                (star) => `
                <ion-icon name="${
                  star <= r.avg_score
                    ? 'star'
                    : star - 0.5 <= r.avg_score
                    ? 'star-half'
                    : 'star-outline'
                }" color="warning"></ion-icon>
              `
              )
              .join('')}
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

      marker.addTo(this.map);
      this.markers.push(marker);
    }

    this.filteredResults = stateResults;
  }
}
