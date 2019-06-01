import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MilesLandingComponent } from './miles-landing/miles-landing.component';
import { MainComponent } from './main/main.component';

const routes: Routes = [
  { path: '', component: MilesLandingComponent },
  { path: 'main', component: MainComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
