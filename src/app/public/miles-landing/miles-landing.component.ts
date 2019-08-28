import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-miles-landing',
  templateUrl: './miles-landing.component.html',
})
export class MilesLandingComponent implements OnInit {

  email: string;
  password: string;

  constructor(private router: Router) {
  }

  ngOnInit() {
  }

  goToMain() {
    $('#loginModal').modal('hide');
    this.router.navigate(['/map']);
  }
}
