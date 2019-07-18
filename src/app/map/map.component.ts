import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {fromEvent} from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
})
export class MapComponent implements OnInit {

  viSerDesktop: boolean;
  viSerMobile: boolean;
  searchKey: string;

  constructor(private router: Router) {
  }

  ngOnInit(): void {
    fromEvent(window, 'resize').subscribe(event => {
      if (window.innerWidth > 768) {
        this.viSerMobile = false;
      } else {
        this.viSerDesktop = false;
      }
    });
    this.viSerDesktop = false;
    this.viSerMobile = false;
  }

  signOut() {
    return this.router.navigate(['/']);
  }

  toggleSearch() {
    if (window.innerWidth > 768) {
      this.viSerDesktop = !this.viSerDesktop;
    } else {
      this.viSerMobile = !this.viSerMobile;
    }
  }

  searchMap() {
    this.searchKey = '';
    this.toggleSearch();
  }
}
