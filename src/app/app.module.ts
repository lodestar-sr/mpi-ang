import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MilesLandingComponent } from './miles-landing/miles-landing.component';
import { MilesNavComponent } from './miles-nav/miles-nav.component';
import { MainComponent } from './main/main.component';
import { MainSidebarComponent } from './main-sidebar/main-sidebar.component';

@NgModule({
  declarations: [
    AppComponent,
    MilesLandingComponent,
    MilesNavComponent,
    MainComponent,
    MainSidebarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
