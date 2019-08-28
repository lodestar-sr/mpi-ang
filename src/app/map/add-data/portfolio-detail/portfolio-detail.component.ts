import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-portfolio-detail',
  templateUrl: './portfolio-detail.component.html',
  styleUrls: ['./portfolio-detail.component.scss']
})
export class PortfolioDetailComponent implements OnInit {

  properties: any[];

  constructor() { }

  ngOnInit() {
    this.properties = [
      {
        status: 'red',
        street: '1541 Linwood Ave',
        city: 'Columbus',
        state: 'OH',
        zipCode: '43207',
        dateDue: '08/20/2019',
        unit: '',
      },
      {
        status: 'red',
        street: '10825 Royalton Rd',
        city: 'Amanda',
        state: 'OH',
        zipCode: '43102',
        dateDue: '08/20/2019',
        unit: '',
      },
      {
        status: 'red',
        street: '805 Rosemore Ave',
        city: 'Whitehall',
        state: 'OH',
        zipCode: '43213',
        dateDue: '08/20/2019',
        unit: '',
      },
      {
        status: 'red',
        street: '294 S Ohio Dr',
        city: 'Columbus',
        state: 'OH',
        zipCode: '43205',
        dateDue: '08/21/2019',
        unit: '',
      },
      {
        status: 'red',
        street: '23464 State Route 141',
        city: 'Lawrence',
        state: 'OH',
        zipCode: '45688',
        dateDue: '08/21/2019',
        unit: '',
      },
      {
        status: 'red',
        street: '495 W Broad St',
        city: 'Columbus',
        state: 'OH',
        zipCode: '43215',
        dateDue: '08/22/2019',
        unit: '',
      },
      {
        status: 'yellow',
        street: '4635 Paxton Dr S',
        city: 'Hilliard',
        state: 'OH',
        zipCode: '43026',
        dateDue: '08/23/2019',
        unit: '',
      },
      {
        status: 'yellow',
        street: '2078 Langham Rd',
        city: 'Upper Arlington',
        state: 'OH',
        zipCode: '43221',
        dateDue: '08/23/2019',
        unit: '',
      },
      {
        status: 'yellow',
        street: '96 W Lincoln Ave',
        city: 'Worthington',
        state: 'OH',
        zipCode: '43085',
        dateDue: '08/24/2019',
        unit: '',
      },
      {
        status: 'yellow',
        street: '1970 Cardigan Ave',
        city: 'Marble Cliff',
        state: 'OH',
        zipCode: '43212',
        dateDue: '08/24/2019',
        unit: '',
      },
      {
        status: 'green',
        street: '7061 Schneider Way',
        city: 'Jefferson Township',
        state: 'OH',
        zipCode: '43004',
        dateDue: '08/25/2019',
        unit: '',
      },
      {
        status: 'green',
        street: '1151 Bayridge Dr',
        city: 'Orange Township',
        state: 'OH',
        zipCode: '43035',
        dateDue: '08/26/2019',
        unit: '',
      },
      {
        status: 'green',
        street: '197 W Park St',
        city: 'Westerville',
        state: 'OH',
        zipCode: '43081',
        dateDue: '08/27/2019',
        unit: '',
      },
      {
        status: 'green',
        street: '7690 Hilliard Ct',
        city: 'Canal Winchester',
        state: 'OH',
        zipCode: '43110',
        dateDue: '08/28/2019',
        unit: '',
      },
    ];
  }

}
