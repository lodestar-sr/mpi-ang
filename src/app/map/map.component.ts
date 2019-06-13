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

  public additionalSidebarClass: string;

  constructor(private router: Router) { }

  ngOnInit(): void {
    fromEvent(window, 'resize').subscribe(event => {
      if (window.innerWidth > 768) {
        this.additionalSidebarClass = '';
        $('.search-box-bottom').hide();
      } else {
        $('.search-box').hide();
      }
    });

    fromEvent<MouseEvent>(document.body, 'click').subscribe((event: any) => {
      if (window.innerWidth <= 768 &&
        event.target.id != 'hamburger' &&
        !event.target.className.includes('fa-compass_regular') &&
        !event.target.className.includes('fa-university_regular') &&
        !event.target.className.includes('fa-landmark-alt_regular') &&
        !event.target.className.includes('fa-city_regular') &&
        !event.target.className.includes('fa-hotel_regular') &&
        !event.target.className.includes('nav-link') &&
        !event.target.className.includes('nav-item')
      ) {
        this.additionalSidebarClass = '';
      }
    });
  }

  signOut() {
    return this.router.navigate(['/']);
  }

  toggleSearch() {
    if (window.innerWidth > 768) {
      $('.search-box').slideToggle(500);
    } else {
      $('.search-box-bottom').slideToggle(500);
    }
  }

  toggleSidebar() {
    if (!this.additionalSidebarClass) {
      this.additionalSidebarClass = 'visible';
    } else {
      this.additionalSidebarClass = '';
    }
  }
}
