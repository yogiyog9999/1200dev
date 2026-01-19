import { Component, NgZone, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { IonInput, ToastController, LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { supabase } from '../../services/supabase.client';

declare var google: any;

@Component({
   standalone: false,
  selector: 'app-editreview',
  templateUrl: './editreview.page.html',
  styleUrls: ['./editreview.page.scss']
})
export class EditreviewPage implements OnInit, AfterViewInit {
  @ViewChild('autocompleteAddress', { static: false }) autocompleteInput!: IonInput;

  reviewId!: string;

  homeowner_first_name = '';
  homeowner_last_name = '';

  project_type = '';
  address = '';
  zip = '';
  project_date: string | null = null;
  comments = '';
  selectedState = '';
  selectedCity = '';
  lat: number | null = null;
  lng: number | null = null;

  files: File[] = [];
  existingFiles: any[] = [];

  services: any[] = [];
  autocomplete: any;

  //stateList: string[] = [... US STATES ...];

  defaultRatings = [
  { key: 'rating_payment', label: 'Payment Timeliness', model: 0 },
  { key: 'rating_communication', label: 'Communication', model: 0 },
  { key: 'rating_scope', label: 'Scope Clarity', model: 0 },
  { key: 'rating_change_orders', label: 'Change Order Fairness', model: 0 },
  { key: 'rating_overall', label: 'Overall Experience', model: 0 }
];

socialRatings = [
  { key: 'rating_approach', label: 'Approachability', model: 0 },
  { key: 'rating_respect', label: 'Respect & Courtesy', model: 0 },
  { key: 'rating_communication_style', label: 'Communication Style', model: 0 },
  { key: 'rating_composure', label: 'Emotional Composure', model: 0 },
  { key: 'rating_trust', label: 'Trustworthiness', model: 0 }
];

// active rating list
ratingCategories: any[] = [];

stateList: string[] = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming"
];

  constructor(
    private route: ActivatedRoute,
    private reviewSvc: ReviewService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private ngZone: NgZone
  ) {}

  async ngOnInit() {
    this.reviewId = this.route.snapshot.paramMap.get('id')!;

    this.services = await this.reviewSvc.getServices();

    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', this.reviewId)
      .single();

    if (!data) {
      this.presentToast('Review not found', 'danger');
      this.router.navigateByUrl('/tabs/myreview');
      return;
    }

    // Map values
	
    this.homeowner_first_name = data.homeowner_first_name;
    this.homeowner_last_name = data.homeowner_last_name;
    this.project_type = data.project_type;
    this.address = data.address;
    this.zip = data.zip;
    this.selectedState = data.state;
    this.selectedCity = data.city;
    this.project_date = data.project_date;
    this.comments = data.comments;
    this.lat = data.lat;
    this.lng = data.lng;

    // Load correct rating group
this.project_type = data.project_type;
this.onInteractionChange();

// Load rating values from DB
this.ratingCategories.forEach(r => {
  r.model = data[r.key] ?? 0;
});
    // Load files
    if (data.files) {
      this.existingFiles = JSON.parse(data.files).map((url: string) => ({
        name: url.split('/').pop(),
        url
      }));
    }
  }

  ngAfterViewInit() {
    this.initAutocomplete();
  }

  onInteractionChange() {
  if (this.project_type === 'Social') {
    this.ratingCategories = JSON.parse(JSON.stringify(this.socialRatings));
  } else {
    this.ratingCategories = JSON.parse(JSON.stringify(this.defaultRatings));
  }
}

  initAutocomplete() {
    this.autocompleteInput.getInputElement().then((inputEl: HTMLInputElement) => {
      this.autocomplete = new google.maps.places.Autocomplete(inputEl, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });

      this.autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          const place = this.autocomplete.getPlace();
          this.extractAddressComponents(place);
        });
      });
    });
  }

  extractAddressComponents(place: any) {
    this.address = place.formatted_address ?? '';

    const comps = place.address_components;

    this.zip = comps.find((c: any) => c.types.includes('postal_code'))?.long_name ?? '';
    this.selectedCity = comps.find((c: any) => c.types.includes('locality'))?.long_name ?? '';
    this.selectedState = comps.find((c: any) => c.types.includes('administrative_area_level_1'))?.long_name ?? '';

    this.lat = place.geometry?.location.lat() ?? null;
    this.lng = place.geometry?.location.lng() ?? null;
  }

  onFileChange(ev: any) {
    this.files = Array.from(ev.target.files || []);
  }

  async deleteFile(file: any) {
    this.existingFiles = this.existingFiles.filter(f => f.url !== file.url);
  }

  async update() {
    const loading = await this.loadingCtrl.create({ message: 'Updating review...' });
    await loading.present();

    try {
      const newFileUrls: string[] = [];

      for (const file of this.files) {
        const path = `reviews/${this.reviewId}_${Date.now()}_${file.name}`;
        await supabase.storage.from('profile-images').upload(path, file);
        const { data } = supabase.storage.from('profile-images').getPublicUrl(path);
        newFileUrls.push(data.publicUrl);
      }

      const allFiles = [...this.existingFiles.map(f => f.url), ...newFileUrls];

      const updateObj: any = {
        homeowner_first_name: this.homeowner_first_name,
        homeowner_last_name: this.homeowner_last_name,
        project_type: this.project_type,
        address: this.address,
        city: this.selectedCity,
        state: this.selectedState,
        zip: this.zip,
        lat: this.lat,
        lng: this.lng,
        project_date: this.project_date,
        comments: this.comments,
        files: JSON.stringify(allFiles)
      };

      this.ratingCategories.forEach(r => updateObj[r.key] = r.model);

      await supabase.from('reviews').update(updateObj).eq('id', this.reviewId);

      this.presentToast('Review updated');
      this.router.navigateByUrl('/tabs/myreview');

    } finally {
      loading.dismiss();
    }
  }

  async presentToast(message: string, color = 'success') {
    const t = await this.toastCtrl.create({ message, duration: 2000, color });
    t.present();
  }
}
