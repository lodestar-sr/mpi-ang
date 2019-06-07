import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MilesLandingComponent } from './miles-landing/miles-landing.component';
import { MilesNavComponent } from './miles-nav/miles-nav.component';
import { MainComponent } from './main/main.component';
import { MainSidebarComponent } from './main-sidebar/main-sidebar.component';
import { MapComponent } from './map/map.component';

@NgModule({
  declarations: [
    AppComponent,
    MilesLandingComponent,
    MilesNavComponent,
    MainComponent,
    MainSidebarComponent,
    MapComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxMapboxGLModule.withConfig({
      accessToken: 'pk.eyJ1Ijoic2RhbGFrb3YiLCJhIjoiY2o1eGxvdnRzMDVhOTJ4bnczd3lpMTRiMiJ9.lb016P2ofij1axIWoobBCQ',
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
