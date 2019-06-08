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

  mapvars = {
    continental: new LngLatBounds(new LngLat(-130, 30), new LngLat(-65, 50)),
    alaska: new LngLatBounds(new LngLat(-180, 50), new LngLat(-140, 75)),
    hawaii: new LngLatBounds(new LngLat(-180, 20), new LngLat(-152, 28))
  };
  fitBound: LngLatBounds;
  fitBoundsOption: any;
  selectedState: string;
  selectedCounty: string;
  states56Json: any;
  countyJson: any;
  countyLabelJson: any;
  countyFilter: any;
  twpPolyJson: any;
  twpLabelJson: any;

  constructor() {
    this.fitBound = this.mapvars.continental;
    this.fitBoundsOption = {};
    this.selectedState = '';
    this.selectedCounty = '';
    this.countyFilter = [];
  }

  ngOnInit() {
    axios.get('http://whistle.mapware.net/jsons/states56.json').then(result => {
      this.states56Json = {
        type: 'geojson',
        data: result.data
      };
    });
  }

  async stateClicked(e) {
    let first = false;
    if (this.selectedState === '') {
      first = true;
    }
    this.selectedState = e.features[0].properties.STATEFP.replace('DEMO ', '').replace('MAPTILER ', '');

    this.fitBound = new LngLatBounds(bbox(e.features[0].geometry));
    this.fitBoundsOption = {
      padding: 10
    };

    if (!first) {
      // map.off('click', 'county_poly', countyClicked);
      // map.removeLayer('county_poly');
      // map.removeLayer('county_label');
      // map.removeSource('county_poly_src');
      // map.removeSource('county_label_src');
    }
    if (this.selectedCounty !== '') {
      // map.removeLayer('twp_poly');
      // map.removeLayer('twp_label');
      // map.removeSource('twp_poly_src');
      // map.removeSource('twp_label_src');
      this.selectedCounty = '';
    }

    const resultCountyPoly = await axios.get('http://whistle.mapware.net/jsons/counties_ok/cnt' + this.selectedState + 'poly.json');
    this.countyJson = resultCountyPoly.data;

    const resultCountyCen = await axios.get('http://whistle.mapware.net/jsons/counties_ok/cnt' + this.selectedState + 'cen.json');
    this.countyLabelJson = resultCountyCen.data;
  }

  async countyClicked(e) {
    if (this.selectedCounty !== '') {
      // map.removeLayer('twp_poly');
      // map.removeLayer('twp_label');
      // map.removeSource('twp_poly_src');
      // map.removeSource('twp_label_src');
    }
    this.selectedCounty = e.features[0].properties.GEOID.replace('DEMO ', '').replace('MAPTILER ', '');

    this.fitBound = new LngLatBounds(bbox(e.features[0].geometry));
    this.fitBoundsOption = {
      padding: 10
    };

    // const filter = ['!in', 'GEOID', selectedCounty, 'DEMO ' + selectedCounty, 'MAPTILER ' + selectedCounty];
    // map.setFilter('county_poly', filter);
    // map.setFilter('county_label', filter);
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
