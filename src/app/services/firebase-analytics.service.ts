import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent, setUserId } from 'firebase/analytics';

@Injectable({ providedIn: 'root' })
export class FirebaseAnalyticsService {
  analytics: any;

  constructor() {
    const firebaseConfig = {
  apiKey: "AIzaSyDI-Y8SUlPpj0495_preN5h4P4zZgaL1qU",
  authDomain: "dlist-app.firebaseapp.com",
  projectId: "dlist-app",
  storageBucket: "dlist-app.firebasestorage.app",
  messagingSenderId: "702713496290",
  appId: "1:702713496290:web:e94eb6ad12a0c07cec14bb",
  measurementId: "G-555MDXLZSL"
};
    const app = initializeApp(firebaseConfig);

    try {
      this.analytics = getAnalytics(app);
    } catch (e) {
      console.warn("Analytics not available:", e);
    }
  }

  log(name: string, params?: any) {
    if (!this.analytics) return;
    logEvent(this.analytics, name, params || {});
  }

  setUserId(uid: string) {
    if (!this.analytics) return;
    setUserId(this.analytics, uid);
  }
}
