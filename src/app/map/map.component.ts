import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

declare var $: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  signOut() {
    return this.router.navigate(['/']);
  }

  toggleSearch() {
    $('.search-box').slideToggle(100);
  }

}
