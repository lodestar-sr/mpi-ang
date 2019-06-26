import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  isSmall: boolean;
  activated: string;

  constructor() { }

  ngOnInit() {
    this.isSmall = false;
    this.activated = 'HOME';
  }

  switchSidebar(sidebar: any, details: any) {
    this.isSmall = !this.isSmall;
    sidebar.style.width = ((this.isSmall ? 56 : 128) + 360) + 'px';

    details.style.left = (this.isSmall ? 56 : 128) + 'px';
  }

  activateMenu(activatedMenu: string) {
    this.activated = activatedMenu;
  }
}
