import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {fromEvent} from 'rxjs';

@Component({
  selector: 'app-map-layout',
  templateUrl: './map-layout.component.html',
})
export class MapLayoutComponent implements OnInit {

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
