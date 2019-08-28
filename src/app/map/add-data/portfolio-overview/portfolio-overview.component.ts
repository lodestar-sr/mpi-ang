import { Component, OnInit } from '@angular/core';
import {PortfolioService} from '../portfolio.service';
import {Router} from "@angular/router";

@Component({
  selector: 'app-portfolio-overview',
  templateUrl: './portfolio-overview.component.html',
  styleUrls: ['./portfolio-overview.component.scss']
})
export class PortfolioOverviewComponent implements OnInit {

  workPriority: any[];
  actionSummary: any[];

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
        entities: 68,
        assets: 144,
      },
      {
        requirement: 'Local Agent',
        type: 'localAgent',
        entities: 68,
        assets: 144,
      },
      {
        requirement: 'Bond',
        type: 'bond',
        entities: 68,
        assets: 144,
      },
      {
        requirement: 'Notary',
        type: 'notary',
        entities: 68,
        assets: 144,
      },
      {
        requirement: 'Inspection',
        type: 'inspection',
        entities: 68,
        assets: 144,
      },
    ];
  }

  onWorkPriority() {
    this.router.navigate(['/map/add-data/details'])
  }

}
