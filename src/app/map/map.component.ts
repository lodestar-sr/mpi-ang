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

  constructor(private router: Router) { }

  ngOnInit(): void {
    fromEvent(window, 'resize').subscribe(event => {
      if (window.innerWidth > 768) {
        $('.search-box-bottom').hide();
      } else {
        $('.search-box').hide();
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
  }
}
