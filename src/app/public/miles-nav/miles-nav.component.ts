import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-miles-nav',
  templateUrl: './miles-nav.component.html',
})
export class MilesNavComponent implements OnInit {

  selected: string;

  constructor() {
  }

  ngOnInit() {
    this.selected = '';
  }

  chooseMenu(item: string) {
    this.selected = item;
  }
}
