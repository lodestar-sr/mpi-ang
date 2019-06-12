import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MilesRoutingModule} from './miles-routing.module';
import {MilesLandingComponent} from './miles-landing/miles-landing.component';
import {MilesNavComponent} from './miles-nav/miles-nav.component';

@NgModule({
  declarations: [
    MilesLandingComponent,
    MilesNavComponent,
  ],
  imports: [
    CommonModule,
    MilesRoutingModule,
  ]
})
export class MilesModule {
}
