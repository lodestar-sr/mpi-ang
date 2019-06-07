import { Component, OnInit } from '@angular/core';
import { LngLat, LngLatBounds } from 'mapbox-gl';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  mapvars = {
    continental: new LngLatBounds(new LngLat(-130, 30), new LngLat(-65, 50)),
    alaska: new LngLatBounds(new LngLat(-180, 50), new LngLat(-140, 75)),
    hawaii: new LngLatBounds(new LngLat(-180, 20), new LngLat(-152, 28))
  };
  selectedState: string;

  constructor() { }

  ngOnInit() {

  }

}
