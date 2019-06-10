import {Component, OnInit} from '@angular/core';
import {LngLat, LngLatBounds, Map, MapMouseEvent, Popup} from 'mapbox-gl';

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
  selectedStateName: string;
  selectedCounty: string;
  selectedCountyName: string;
  selectedTownshipCnt: any;
  selectedTownshipId: any;
  selectedTownshipGeoid: any;
  selectedTownshipName: any;
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
    this.selectedStateName = '';
    this.selectedCounty = '';
    this.selectedCountyName = '';
    this.countyFilter = [];
    this.countyJson = {};
    this.countyLabelJson = {};
    this.twpPolyJson = {};
    this.twpLabelJson = {};
  }

  ngOnInit() {
  }

  onLoad(mapInst: Map) {
    this.map = mapInst;
    this.map.fitBounds(this.mapvars.continental);
    this.map.addSource('states_src', {
      type: 'geojson',
      data: 'http://whistle.mapware.net/jsons/states56.json'
    });
    this.map.addLayer({
      id: 'states_poly',
      type: 'fill',
      source: 'states_src',
      filter: ['!in', 'STATEFP', this.selectedState, 'DEMO ' + this.selectedState, 'MAPTILER ' + this.selectedState],
      layout: {
        visibility: 'visible'
      },
      paint: {
        'fill-color': '#8B4513',
        'fill-outline-color': '#8B4513',
        'fill-antialias': true,
        'fill-opacity': 0.3
      }
    });
    this.map.addLayer({
      id: 'states_line',
      type: 'line',
      source: 'states_src',
      layout: {
        visibility: 'visible'
      },
      paint: {
        'line-color': '#8B4513',
        'line-width': 3,
        'line-opacity': 1
      }
    });
    this.map.on('click', 'states_poly', (evt: MapMouseEvent) => this.stateClicked(evt));
  }

  stateClicked(e) {
    let first = false;
    if (this.selectedState === '') {
      first = true;
    }
    this.selectedState = e.features[0].properties.STATEFP.replace('DEMO ', '').replace('MAPTILER ', '');
    this.selectedStateName = e.features[0].properties.NAME.replace('DEMO ', '').replace('MAPTILER ', '');
    const bb = new LngLatBounds(
      new LngLat(e.features[0].properties.EXT_MIN_X, e.features[0].properties.EXT_MIN_Y),
      new LngLat(e.features[0].properties.EXT_MAX_X, e.features[0].properties.EXT_MAX_Y)
    );
    this.map.fitBounds(bb, {padding: 10});
    const filter = ['!in', 'STATEFP', this.selectedState, 'DEMO ' + this.selectedState, 'MAPTILER ' + this.selectedState];
    this.map.setFilter('states_poly', filter);

    if (!first) {
      this.map.off('click', 'county_poly', (evt: MapMouseEvent) => this.countyClicked(evt));
      this.map.removeLayer('county_poly');
      this.map.removeLayer('county_label');
      this.map.removeSource('county_poly_src');
      this.map.removeSource('county_label_src');
      this.map.off('click', 'places_poly', (evt: MapMouseEvent) => this.placeClicked(evt));
      this.map.removeLayer('places_poly');
      this.map.removeLayer('places_label');
      this.map.removeSource('places_src');
    }
    if (this.selectedCounty !== '') {
      this.map.removeLayer('twp_poly');
      this.map.removeLayer('twp_label');
      this.map.removeSource('twp_poly_src');
      this.map.removeSource('twp_label_src');
      this.selectedCounty = '';
    }

    this.map.addSource('county_poly_src', {
      type: 'geojson',
      data: 'http://whistle.mapware.net/jsons/counties_ok/cnt' + this.selectedState + 'poly.json',
    });
    this.map.addLayer({
      id: 'county_poly',
      type: 'fill',
      source: 'county_poly_src',
      layout: {
        visibility: 'visible'
      },
      paint: {
        'fill-color': '#8B4513',
        'fill-outline-color': '#8B4513',
        'fill-antialias': true,
        'fill-opacity': 0.45
      }
    });

    this.map.addSource('county_label_src', {
      type: 'geojson',
      data: 'http://whistle.mapware.net/jsons/counties_ok/cnt' + this.selectedState + 'cen.json'
    });
    this.map.addLayer({
      id: 'county_label',
      type: 'symbol',
      source: 'county_label_src',
      layout: {
        'text-field': '{NAME}',
        'text-font': [
          'DIN Offc Pro Medium',
          'Arial Unicode MS Bold'
        ],
        'text-size': 15
      },
      paint: {
        'text-halo-color' : '#ffffff',
        'text-halo-width' : 1,
        'text-color': 'rgb(20, 20, 20)'
      }
    });
    this.map.on('click', 'county_poly', (evt: MapMouseEvent) => this.countyClicked(evt));

    this.map.addSource('places_src', {
      type: 'geojson',
      data: 'http://whistle.mapware.net/jsons/places_ok/places' + this.selectedState + '.json'
    });
    this.map.addLayer({
      id: 'places_poly',
      type: 'fill',
      source: 'places_src',
      layout: {
        visibility: 'none'
      },
      paint: {
        'fill-color': '#33cccc',
        'fill-outline-color': '#ffffff',
        'fill-antialias': true,
        'fill-opacity': 0.8
      }
    });
    this.map.addLayer({
      id: 'places_label',
      type: 'symbol',
      source: 'places_src',
      layout: {
        visibility: 'none',
        'text-field': '{NAME}',
        'text-font': [
          'DIN Offc Pro Medium',
          'Arial Unicode MS Bold'
        ],
        'text-size': 11
      },
      paint: {
        'text-color': 'rgb(0, 0, 0)'
      }
    });
    this.map.on('click', 'places_poly', (evt: MapMouseEvent) => this.placeClicked(evt));
  }

  async countyClicked(e) {
    if (this.selectedCounty !== '') {
      this.map.removeLayer('twp_poly');
      this.map.removeLayer('twp_label');
      this.map.removeSource('twp_poly_src');
      this.map.removeSource('twp_label_src');
    }
    this.map.setLayoutProperty('places_poly', 'visibility', 'none');
    this.map.setLayoutProperty('places_label', 'visibility', 'none');

    this.selectedCounty = e.features[0].properties.GEOID;
    this.selectedCountyName = e.features[0].properties.NAME ;
    const bbox = new LngLatBounds(
      new LngLat(e.features[0].properties.EXT_MIN_X, e.features[0].properties.EXT_MIN_Y),
      new LngLat(e.features[0].properties.EXT_MAX_X, e.features[0].properties.EXT_MAX_Y)
    );
    this.map.fitBounds(bbox, {padding: 10});
    const filter = ['!in', 'GEOID', this.selectedCounty, 'DEMO ' + this.selectedCounty, 'MAPTILER ' + this.selectedCounty];
    this.map.setFilter('county_poly', filter);
    this.map.setFilter('county_label', filter);

    this.map.addSource('twp_poly_src', {
      type: 'geojson',
      data: 'http://whistle.mapware.net/jsons/towns_ok/twp' + this.selectedCounty + '.json'
    });
    this.map.addSource('twp_label_src', {
      type: 'geojson',
      data: 'http://whistle.mapware.net/jsons/towns_ok/twp' + this.selectedCounty + 'cen.json'
    });

    this.map.addLayer({
      id: 'twp_poly',
      type: 'fill',
      source: 'twp_poly_src',
      layout: {
        visibility: 'visible'
      },
      paint: {
        'fill-color': '#8B4513',
        'fill-outline-color': '#8B4513',
        'fill-antialias': true,
        'fill-opacity': 0.52
      }
    });
    this.map.addLayer({
      id: 'twp_label',
      type: 'symbol',
      source: 'twp_label_src',
      layout: {
        'text-field': '{NAME}',
        'text-font': [
          'DIN Offc Pro Medium',
          'Arial Unicode MS Bold'
        ],
        'text-size': 13
      },
      paint: {
        'text-color': 'rgb(20, 20, 20)'
      }
    });
    this.map.on('click', 'twp_poly', (evt: MapMouseEvent) => this.townshipClicked(evt));
  }

  townshipClicked(e) {
    this.selectedTownshipCnt = e.features[0].properties.CountyID;
    this.selectedTownshipId = e.features[0].properties.COUSUBFP;
    this.selectedTownshipGeoid = e.features[0].properties.GEOID;
    this.selectedTownshipName = e.features[0].properties.NAMELSAD;
    const placesfilter = ['all', ['==', 'COUSUBFP', this.selectedTownshipId], ['==', 'CountyID', this.selectedTownshipCnt]];
    this.map.setFilter('places_poly', placesfilter);
    this.map.setFilter('places_label', placesfilter);
    this.map.setLayoutProperty('places_poly', 'visibility', 'visible');
    this.map.setLayoutProperty('places_label', 'visibility', 'visible');
    const twpfilter = [ '!in' , 'GEOID', this.selectedTownshipGeoid];
    this.map.setFilter('twp_poly', twpfilter);
    this.map.setFilter('twp_label', twpfilter);
  }

  placeClicked(e) {
    const html = '<strong>' + e.features[0].properties.NAMELSAD + '</strong><br />' + this.selectedTownshipName + '<br />' +
      this.selectedCountyName + ' County<br />' + this.selectedStateName;
    new Popup()
      .setLngLat(e.lngLat)
      .setHTML(html)
      .addTo(this.map);
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
