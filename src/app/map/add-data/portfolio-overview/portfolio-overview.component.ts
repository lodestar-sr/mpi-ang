import { Component, OnInit } from '@angular/core';
import {PortfolioService} from '../portfolio.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-portfolio-overview',
  templateUrl: './portfolio-overview.component.html',
  styleUrls: ['./portfolio-overview.component.scss']
})
export class PortfolioOverviewComponent implements OnInit {

  workPriority: any[];
  actionSummary: any[];
  vprStatus: any;
  vprStatusPercentage: any;

  constructor(private portfolioService: PortfolioService, private router: Router) { }

  ngOnInit() {
    this.workPriority = [
      {
        count: 15,
        description: 'Montgomery County Vacant Property Registration',
        duration: 10,
        document: true,
        bond: true,
        inspection: true,
      },
      {
        count: 36,
        description: 'Cleveland City Vacant Property Registration',
        duration: 10,
        document: true,
        localAgent: true,
      },
      {
        count: 12,
        description: 'Cincinnati Vacant/Foreclosed Property Registration',
        duration: 10,
        document: true,
        notary: true,
        inspection: true,
      },
      {
        count: 3,
        description: 'Lorain County Residential Property Registration',
        duration: 10,
        document: true,
        bond: true,
      },
      {
        count: 14,
        description: 'Nelsonville Vacant Building Registration',
        duration: 10,
        document: true,
        localAgent: true,
        bond: true,
        notary: true,
        inspection: true,
      },
    ];

    this.actionSummary = [
      {
        requirement: 'Document',
        type: 'document',
        entities: 68,
        assets: 144,
      },
      {
        requirement: 'Online',
        type: 'online',
        entities: 5,
        assets: 3,
      },
      {
        requirement: 'Local Agent',
        type: 'localAgent',
        entities: 12,
        assets: 38,
      },
      {
        requirement: 'Bond',
        type: 'bond',
        entities: 18,
        assets: 24,
      },
      {
        requirement: 'Notary',
        type: 'notary',
        entities: 21,
        assets: 86,
      },
      {
        requirement: 'Inspection',
        type: 'inspection',
        entities: 38,
        assets: 62,
      },
    ];
    this.vprStatus = {
      asset: 161,
      expired: 14,
      unregistered: 48,
      required: 147,
      registered: 85,
      dataList: {
        expired: [8, 3, 2, 1, 0],
        unregistered: [23, 13, 5, 3, 4],
      }
    };
    this.vprStatusPercentage = {
      asset: false,
      expired: false,
      unregistered: false,
      required: false,
      registered: false,
      dataList: false,
    };
  }

  onWorkPriority() {
    this.router.navigate(['/map/add-data/details']);
  }

  getPercent(val) {
    return (val / this.vprStatus.asset).toFixed(2);
  }
}
