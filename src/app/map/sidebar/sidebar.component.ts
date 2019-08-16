import {Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {AppService} from '../../app.service';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit, OnDestroy {

  @ViewChild('homeElement') homeEle: ElementRef;
  @ViewChild('searchElement') searchEle: ElementRef;
  @ViewChild('addElement') addEle: ElementRef;
  @ViewChild('drawElement') drawEle: ElementRef;
  @ViewChild('boundaryElement') boundaryEle: ElementRef;
  @ViewChild('layerElement') layerEle: ElementRef;

  @ViewChild('sidebar') sidebarEle: ElementRef;
  @ViewChild('detailsPanel') detailsPanelEle: ElementRef;

  isSmall: boolean;
  activated: string;
  details: any[];
  selectedDetail: number;
  subscription: Subscription;

  constructor(private appService: AppService, private zone: NgZone, private http: HttpClient) {
    this.subscription = this.appService.getMessage().subscribe(message => {
      this.zone.run(() => {
        if (message.type == 'state') {
          this.attributeState(message);
          this.minimizeSidebar();
        } else if (message.type == 'county') {
          this.attributeCounty(message);
          this.minimizeSidebar();
        } else if (message.type == 'town') {
          this.attributeTown(message);
          this.minimizeSidebar();
        } else if (message.type == 'gotoHome') {
          this.details = [];
          this.selectedDetail = -1;
          setTimeout(() => this.appService.sendMessage({type: 'resizeMap'}), 500);
        }
      });
    });
  }

  ngOnInit() {
    this.isSmall = false;
    this.activated = 'HOME';
    this.details = [];
    this.selectedDetail = -1;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  switchSidebar() {
    this.isSmall = !this.isSmall;

    if (this.detailsPanelEle) {
      this.detailsPanelEle.nativeElement.style.left = (this.isSmall ? 56 : 144) + 'px';
    }

    setTimeout(() => this.appService.sendMessage({type: 'resizeMap'}), 500);
    setTimeout(() => this.moveScrollbar(), 300);
  }

  minimizeSidebar() {
    if (!this.isSmall) {
      this.switchSidebar();
    }
  }

  activateMenu(activatedMenu: string) {
    this.activated = activatedMenu;

    if (this.activated == 'HOME') {
      this.details = [];
      this.appService.sendMessage({type: 'initMap'});
    }

    this.moveScrollbar();
  }

  moveScrollbar() {
    let top = 0;
    switch (this.activated) {
      case 'HOME':
        top = this.homeEle.nativeElement.offsetTop;
        break;
      case 'SEARCH':
        top = this.searchEle.nativeElement.offsetTop;
        break;
      case 'ADD_DATA':
        top = this.addEle.nativeElement.offsetTop;
        break;
      case 'DRAW':
        top = this.drawEle.nativeElement.offsetTop;
        break;
      case 'BOUNDARIES':
        top = this.boundaryEle.nativeElement.offsetTop;
        break;
      case 'DATA_LAYERS':
        top = this.layerEle.nativeElement.offsetTop;
        break;
    }

    const scrollBar: any = document.querySelector('.scroll-bar');
    scrollBar.style.top = top + 'px';
  }

  attributeState(message: any) {
    this.http.get('assets/jsons/state_scorecard_v2.json').subscribe((data: any) => {
      const stateData = data.state_scorecards.scorecard_data.filter(item => {
        return item.fips_state == message.id;
      });

      const header1 = data.state_scorecards.card1_header;
      const header2 = data.state_scorecards.card2_header;
      const header3 = data.state_scorecards.card3_header;

      if (stateData.length > 0) {
        this.details.push({
          title: stateData[0].state_name,
          type: 'state',
          header1: {
            name: header1,
            value: stateData[0]['state_prop_reg_reqs'],
          },
          header2: {
            name: header2,
            value: stateData[0]['counties_prop_reg_reqs'],
          },
          header3: {
            name: header3,
            value: stateData[0]['munis_prop_reg_reqs'],
          },
          description: '**STATE DATA FEED** This is the area where all data about the selected authority will appear.',
        });
      } else {
        this.details.push({
          title: message.name,
          type: 'state',
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
        });
      }
      this.selectedDetail = this.details.length - 1;
      setTimeout(() => this.appService.sendMessage({type: 'resizeMap'}), 500);
    });
  }

  attributeCounty(message: any) {
    this.http.get('assets/jsons/scorecard.json').subscribe((data: any) => {

      const countyData = data.county_scorecards.scorecard_data.filter(item => {
        return item.fips == message.id;
      });

      const isDemo = environment.demo;

      const header1 = data.county_scorecards.card1_header;
      const header2 = data.county_scorecards.card2_header;
      const header3 = data.county_scorecards.card3_header;

      if (countyData.length > 0) {
        this.details.push({
          title: countyData[0].name,
          type: 'county',
          header1: {
            name: header1,
            value: countyData[0].card1[isDemo ? 'demo_value' : 'value'],
          },
          header2: {
            name: header2,
            value: countyData[0].card2[isDemo ? 'demo_value' : 'value'],
          },
          header3: {
            name: header3,
            value: countyData[0].card3[isDemo ? 'demo_value' : 'value'],
          },
          description: '**COUNTY DATA FEED** This is the area where all data about the selected authority will appear.',
        });
      } else {
        this.details.push({
          title: message.name,
          type: 'county',
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
        });
      }
      this.selectedDetail = this.details.length - 1;
      setTimeout(() => this.appService.sendMessage({type: 'resizeMap'}), 500);
    });
  }

  attributeTown(message: any) {
    this.details.push({
      title: message.name,
      type: 'town',
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
    });
    this.selectedDetail = this.details.length - 1;
    setTimeout(() => this.appService.sendMessage({type: 'resizeMap'}), 500);
  }

  onBack() {
    if (this.selectedDetail > 0) {
      this.selectedDetail --;
    }
  }
}
