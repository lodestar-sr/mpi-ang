import {Component, OnInit} from '@angular/core';
import {SwUpdate} from '@angular/service-worker';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {

  constructor(private swUpdate: SwUpdate) {

  }

  ngOnInit(): void {
    this.swUpdate.available.subscribe(() => {
      if (confirm('New version available. Please load new version.')) {
        window.location.reload();
      }
    });
  }

}
