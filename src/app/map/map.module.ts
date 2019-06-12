import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MapRoutingModule} from './map-routing.module';
import {NgxMapboxGLModule} from 'ngx-mapbox-gl';
import {MapComponent} from './map.component';
import {SidebarComponent} from './sidebar/sidebar.component';
import {MilesMapComponent} from './miles-map/miles-map.component';

@NgModule({
  declarations: [MapComponent, SidebarComponent, MilesMapComponent],
  imports: [
    CommonModule,
    MapRoutingModule,
    NgxMapboxGLModule.withConfig({
      accessToken: 'pk.eyJ1Ijoic2RhbGFrb3YiLCJhIjoiY2o1eGxvdnRzMDVhOTJ4bnczd3lpMTRiMiJ9.lb016P2ofij1axIWoobBCQ',
    })
  ]
})
export class MapModule {
}
