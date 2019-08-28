import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-data',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss']
})
export class AddDataComponent implements OnInit {

  csvFile: File;

  constructor() {
    this.csvFile = null;
  }

  ngOnInit() {
  }

  onSelect(event) {
    if (event.addedFiles && event.addedFiles.length) {
      this.csvFile = event.addedFiles[0];
      console.log(this.csvFile);
    }
  }

}
