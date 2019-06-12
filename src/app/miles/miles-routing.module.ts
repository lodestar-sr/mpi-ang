import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {MilesLandingComponent} from './miles-landing/miles-landing.component';

const routes: Routes = [
  {path: '', component: MilesLandingComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MilesRoutingModule {
}
