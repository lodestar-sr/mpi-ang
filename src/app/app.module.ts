import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {FullLayoutComponent} from './layout/full-layout/full-layout.component';
import {MapLayoutComponent} from './layout/map-layout/map-layout.component';
import {SidebarComponent} from './layout/sidebar/sidebar.component';
import {MilesLandingComponent} from './miles/miles-landing/miles-landing.component';
import {MilesNavComponent} from './miles/miles-nav/miles-nav.component';
import {CommonModule} from '@angular/common';
import {NgxMapboxGLModule} from 'ngx-mapbox-gl';
import {HttpClientModule} from '@angular/common/http';
import {MilesMapComponent} from './map/miles-map/miles-map.component';

@NgModule({
  declarations: [
    AppComponent,
    FullLayoutComponent,
    MapLayoutComponent,
    SidebarComponent,
    MilesLandingComponent,
    MilesNavComponent,
    MilesMapComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
    CommonModule,
    FormsModule,
    NgxMapboxGLModule.withConfig({
      accessToken: 'pk.eyJ1Ijoic2RhbGFrb3YiLCJhIjoiY2o1eGxvdnRzMDVhOTJ4bnczd3lpMTRiMiJ9.lb016P2ofij1axIWoobBCQ',
    }),
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
