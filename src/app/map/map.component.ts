import { Component, OnInit } from '@angular/core';
import { LngLat, LngLatBounds } from 'mapbox-gl';
import bbox from '@turf/bbox';
import axios from 'axios';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  map: Map;
  mapvars = {
    continental: new LngLatBounds(new LngLat(-130, 30), new LngLat(-65, 50)),
    alaska: new LngLatBounds(new LngLat(-180, 50), new LngLat(-140, 75)),
    hawaii: new LngLatBounds(new LngLat(-180, 20), new LngLat(-152, 28))
  };
  fitBound: LngLatBounds;
  fitBoundsOption: any;
  selectedState: string;
  selectedCounty: string;
  countyFilter: any;
  states56Json: any;
  countyJson: any;
  countyLabelJson: any;
  twpPolyJson: any;
  twpLabelJson: any;

  constructor() {
    this.fitBound = this.mapvars.continental;
    this.fitBoundsOption = {};
    this.selectedState = '';
    this.selectedCounty = '';
    this.countyFilter = [];
    this.countyJson = {};
    this.countyLabelJson = {};
    this.twpPolyJson = {};
    this.twpLabelJson = {};
  }

  ngOnInit() {
    axios.get('http://whistle.mapware.net/jsons/states56.json').then(result => {
      this.states56Json = {
        type: 'geojson',
        data: result.data
      };
    });
  }

  onLoad(mapInst: Map) {
    this.map = mapInst;
  }

  async stateClicked(e) {
    let first = false;
    if (this.selectedState === '') {
      first = true;
    }
    this.selectedState = e.features[0].properties.STATEFP.replace('DEMO ', '').replace('MAPTILER ', '');

    const bBox: number[] = bbox(e.features[0].geometry);
    this.fitBound = new LngLatBounds(bBox);

    if (!first) {
      // this.map.off('click', 'county_poly', countyClicked);
      this.map.removeLayer('county_poly');
      this.map.removeLayer('county_label');
      // this.map.removeSource('county_poly_src');
      // this.map.removeSource('county_label_src');
    }
    if (this.selectedCounty !== '') {
      this.map.removeLayer('twp_poly');
      this.map.removeLayer('twp_label');
      // this.map.removeSource('twp_poly_src');
      // this.map.removeSource('twp_label_src');
      this.selectedCounty = '';
    }

    const resultCountyPoly = await axios.get('http://whistle.mapware.net/jsons/counties_ok/cnt' + this.selectedState + 'poly.json');
    this.countyJson = resultCountyPoly.data;

    const resultCountyCen = await axios.get('http://whistle.mapware.net/jsons/counties_ok/cnt' + this.selectedState + 'cen.json');
    this.countyLabelJson = resultCountyCen.data;
  }

  async countyClicked(e) {
    if (this.selectedCounty !== '') {
      this.map.removeLayer('twp_poly');
      this.map.removeLayer('twp_label');
      // this.map.removeSource('twp_poly_src');
      // this.map.removeSource('twp_label_src');
    }
    this.selectedCounty = e.features[0].properties.GEOID.replace('DEMO ', '').replace('MAPTILER ', '');

    this.fitBound = new LngLatBounds(bbox(e.features[0].geometry));

    const resultTwpPoly = await axios.get('http://whistle.mapware.net/jsons/towns_ok/twp' + this.selectedCounty + '.json');
    this.twpPolyJson = resultTwpPoly.data;

    const resultTwpCen = await axios.get('http://whistle.mapware.net/jsons/towns_ok/twp' + this.selectedState + 'cen.json');
    this.twpLabelJson = resultTwpCen.data;
  }

  viewCont() {
    this.fitBound = this.mapvars.continental;
  }
  viewAlaska() {
    this.fitBound = this.mapvars.alaska;
  }
  viewHawaii() {
    this.fitBound = this.mapvars.hawaii;
  }
}
