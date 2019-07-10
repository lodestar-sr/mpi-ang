import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {AppService} from '../../app.service';

declare var $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, AfterViewInit {

  isSmall: boolean;
  activated: string;
  details: any[];
  selectedDetail: number;
  subscription: Subscription;

  constructor(private appService: AppService) {
    this.subscription = this.appService.getMessage().subscribe(message => {
      if (message.msg == 'stateSelected') {
        this.details = [
          {
            title: 'COLORADO',
            header1: {
              name: 'COUNTIES',
              value: 64
            },
            header2: {
              name: 'REPORTING',
              value: 64
            },
            header3: {
              name: 'ORDINANCES',
              value: 64
            },
            description: '**STATE DATA FEED** This is the area where all data about the selected authority will appear.',
            updated: '06/25/2019'
          },
          {
            title: 'EAGLE',
            header1: {
              name: 'MUNI\'S.',
              value: 11
            },
            header2: {
              name: 'REPORTING',
              value: 11
            },
            header3: {
              name: 'ORDINANCES',
              value: 8
            },
            description: '**COUNTY DATA FEED** This is the area where all data about the selected authority will appear.',
            updated: '06/25/2019'
          },
          {
            title: 'EDWARDS',
            header1: {
              name: 'PROPERTIES',
              value: 9985
            },
            header2: {
              name: 'MANAGED',
              value: 0
            },
            header3: {
              name: 'ORDINANCES',
              value: 2
            },
            description: '**MUNI DATA FEED** This is the area where all data about the selected authority will appear.',
            updated: '06/25/2019'
          },
        ];
      } else if (message.msg == 'stateRemoved') {
        this.details = [];
      }
    });
  }

  ngOnInit() {
    this.isSmall = false;
    this.activated = 'HOME';
    this.details = [];
    this.selectedDetail = 0;
  }

  ngAfterViewInit(): void {
    this.recalculateHeight(this.selectedDetail);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  recalculateHeight(no) {
    const headerHeight = 122;
    const wrapper = document.querySelector('.accordion-wrapper');
    if (wrapper) {
      const wrapHeight = wrapper.clientHeight;
      const cnt = document.querySelectorAll('.card').length;
      const freeSpace = wrapHeight - cnt * (headerHeight + 8.5);
      const cardbody: any = document.querySelector('#collapse' + no + ' .card-body');
      if (cardbody) {
        cardbody.style.height = freeSpace + 'px';
      }
    }
  }

  switchSidebar(sidebar: any, dtls: any) {
    this.isSmall = !this.isSmall;

    if (dtls) {
      dtls.style.left = (this.isSmall ? 56 : 128) + 'px';
    }
  }

  activateMenu(activatedMenu: string) {
    this.activated = activatedMenu;
  }

  changeStatus(no) {
    const ele = document.querySelector('#collapse' + no);
    if (!ele.className.includes('show')) {      // closed status -> open status
      this.recalculateHeight(no);
    } else {    // opened status -> close status
      const cardbody: any = document.querySelector('#collapse' + no + ' .card-body');
      cardbody.style.height = '0px';
    }
  }
}
