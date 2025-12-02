import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
})
export class SplashComponent implements OnInit {
  showSplash = true;

  ngOnInit() {
    setTimeout(() => {
      this.showSplash = false; // hide splash after 2-3 seconds
    }, 2000);
  }
}
