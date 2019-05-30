import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MilesLandingComponent } from './miles-landing/miles-landing.component';
import { MilesNavComponent } from './miles-nav/miles-nav.component';

@NgModule({
  declarations: [
    AppComponent,
    MilesLandingComponent,
    MilesNavComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
