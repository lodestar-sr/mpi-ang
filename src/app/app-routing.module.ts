import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {FullLayoutComponent} from './layout/full-layout/full-layout.component';
import {MilesLandingComponent} from './miles/miles-landing/miles-landing.component';
import {MapLayoutComponent} from './layout/map-layout/map-layout.component';
import {MilesMapComponent} from './map/miles-map/miles-map.component';

const routes: Routes = [
  {
    path: '',
    component: FullLayoutComponent,
    children: [
      {path: '', component:  MilesLandingComponent}
    ]
  },
  {
    path: 'map',
    component: MapLayoutComponent,
    children: [
      {path: '', component: MilesMapComponent}
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
