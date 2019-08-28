import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {PortfolioService} from './portfolio.service';

@Component({
  selector: 'app-add-data',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss']
})
export class AddDataComponent implements OnInit {

  constructor(private router: Router, private portfolioService: PortfolioService) {
  }

  ngOnInit() {
  }

  onSelect(event) {
    if (event.addedFiles && event.addedFiles.length) {
      this.portfolioService.csvFile = event.addedFiles[0];
      console.log(this.portfolioService.csvFile);
      this.router.navigate(['/map/add-data/overview']);
    }
  }

}
