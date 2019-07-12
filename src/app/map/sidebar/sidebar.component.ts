import {AfterViewInit, Component, NgZone, OnInit} from '@angular/core';
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

  constructor(private appService: AppService, private zone: NgZone) {
    this.subscription = this.appService.getMessage().subscribe(message => {
      this.zone.run(() => {
        if (message.type == 'state') {
          this.attributeState(message);
        } else if (message.type == 'county') {
          this.attributeCounty(message);
        } else if (message.type == 'town') {
          this.attributeTown(message);
        } else if (message.type == 'gotoHome') {
          this.details = [];
          setTimeout(() => this.appService.sendMessage({type: 'resizeMap'}), 500);
        }
      });
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

    setTimeout(() => this.appService.sendMessage({type: 'resizeMap'}), 500);
  }

  activateMenu(activatedMenu: string) {
    this.activated = activatedMenu;

    if (this.activated == 'HOME') {
      this.details = [];
      this.appService.sendMessage({type: 'initMap'});
    }
  }

  changeStatus(no) {
    const ele = document.querySelector('#collapse' + no);
    if (!ele.className.includes('show')) {      // closed status -> open status
      this.recalculateHeight(no);
    } else {                                                // opened status -> close status
      const cardbody: any = document.querySelector('#collapse' + no + ' .card-body');
      cardbody.style.height = '0px';
    }
  }

  attributeState(message: any) {
    this.details = [];
    this.details[0] = {
      title: message.name,
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
    };
    this.selectedDetail = 0;
    setTimeout(() => this.recalculateHeight(this.selectedDetail), 500);
    setTimeout(() => this.appService.sendMessage({type: 'resizeMap'}), 500);
  }

  attributeCounty(message: any) {
    const tmp = Object.assign({}, this.details[0]);
    this.details = [];
    this.details[0] = tmp;
    this.details[1] = {
      title: message.name,
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
    };
    if (this.details.length == 3) {
      this.details.pop();
    }
    this.selectedDetail = 1;
    setTimeout(() => this.recalculateHeight(this.selectedDetail), 500);
    setTimeout(() => this.appService.sendMessage({type: 'resizeMap'}), 500);
  }

  attributeTown(message: any) {
    const tmp0 = Object.assign({}, this.details[0]);
    const tmp1 = Object.assign({}, this.details[1]);
    this.details = [];
    this.details[0] = tmp0;
    this.details[1] = tmp1;
    this.details[2] = {
      title: message.name,
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
    };
    this.selectedDetail = 2;
    setTimeout(() => this.recalculateHeight(this.selectedDetail), 500);
    setTimeout(() => this.appService.sendMessage({type: 'resizeMap'}), 500);
  }
}
