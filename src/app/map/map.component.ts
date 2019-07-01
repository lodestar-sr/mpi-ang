import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {fromEvent} from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  viSerDesktop: boolean;
  viSerMobile: boolean;

  constructor(private router: Router) { }

  ngOnInit(): void {
    fromEvent(window, 'resize').subscribe(event => {
      if (window.innerWidth > 768) {
        $('.search-box-bottom').hide();
      } else {
        $('.search-box').hide();
      }
    });
    this.viSerDesktop = false;
    this.viSerMobile = false;
  }

  signOut() {
    return this.router.navigate(['/']);
  }

  toggleSearch() {
    if (window.innerWidth > 576) {
      this.viSerDesktop = !this.viSerDesktop;
    } else {
      this.viSerMobile = !this.viSerMobile;
    }
  }
}
