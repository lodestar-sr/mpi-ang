import {Component, OnInit} from '@angular/core';
import {IControl, LngLat, LngLatBounds, Map, MapMouseEvent, Popup} from 'mapbox-gl';

@Component({
  selector: 'app-miles-map',
  templateUrl: './miles-map.component.html',
  styleUrls: ['./miles-map.component.scss']
})
export class MilesMapComponent implements OnInit {

  map: Map;
  mapvars = {
    continental: new LngLatBounds(new LngLat(-130, 30), new LngLat(-65, 50)),
    alaska: new LngLatBounds(new LngLat(-180, 50), new LngLat(-140, 75)),
    hawaii: new LngLatBounds(new LngLat(-180, 20), new LngLat(-152, 28))
  };
  mapControl: IControl;
  selectedState: string;
  selectedStateName: string;
  selectedCounty: string;
  selectedCountyName: string;
  selectedTownshipCnt: any;
  selectedTownshipId: any;
  selectedTownshipGeoid: any;
  selectedTownshipName: any;
  datapath: string;

  constructor() {
    this.selectedState = '';
    this.selectedStateName = '';
    this.selectedCounty = '';
    this.selectedCountyName = '';
    this.datapath = '';//'https://mpi-dev-proc.firebaseapp.com';
  }

  ngOnInit() {
  }

  onLoad(mapInst: Map) {
    this.map = mapInst;
    this.map.fitBounds(this.mapvars.continental);
    this.map.addSource('states_src', {
      type: 'vector',
      tiles: [this.datapath + '/assets/tiles/states/{z}/{x}/{y}.pbf']
    });
    this.map.addLayer({
      id: 'states_poly',
      type: 'fill',
      source: 'states_src',
      'source-layer': 'states',
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
      'source-layer': 'states',
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
    this.mapControl = {onAdd: this.controlOnAdd, onRemove: this.controlOnRemove};
    this.map.addControl(this.mapControl, 'bottom-left');
  }

  controlOnAdd(map) {
    const container = document.createElement('div');
    container.id = 'zoom-buttons';
    const b1 = window.document.createElement('button');
    b1.style.clear = 'none';
    b1.className = 'mapboxgl-ctrl';
    b1.innerHTML = '<img src="/assets/images/map1_64.png"/>';
    b1.addEventListener('click', (e) => {
      map.fitBounds(new LngLatBounds(new LngLat(-130, 30), new LngLat(-65, 50)));
      e.stopPropagation();
    }, false);
    container.appendChild(b1);
    const b2 = window.document.createElement('button');
    b2.style.clear = 'none';
    b2.className = 'mapboxgl-ctrl';
    b2.innerHTML = '<img src="/assets/images/map2_64.png"/>';
    b2.addEventListener('click', (e) => {
      map.fitBounds(new LngLatBounds(new LngLat(-206.05, 45.85), new LngLat(-126.95, 71.65)));
      e.stopPropagation();
    }, false);
    container.appendChild(b2);
    const b3 = window.document.createElement('button');
    b3.style.clear = 'none';
    b3.className = 'mapboxgl-ctrl';
    b3.innerHTML = '<img src="/assets/images/map3_64.png"/>';
    b3.addEventListener('click', (e) => {
      map.fitBounds(new LngLatBounds(new LngLat(-180, 20), new LngLat(-152, 28)));
      e.stopPropagation();
    }, false);
    container.appendChild(b3);
    return container;
  }

  controlOnRemove(map) {
    const container = document.getElementById('zoom-buttons');
    container.parentNode.removeChild(container);
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
      type: 'vector',
      tiles: [this.datapath + '/assets/tiles/counties/' + this.selectedState + '/{z}/{x}/{y}.pbf'],
    });
    this.map.addLayer({
      id: 'county_poly',
      type: 'fill',
      source: 'county_poly_src',
      'source-layer': 'counties',
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
      data: this.datapath + '/assets/jsons/counties_ok/cnt' + this.selectedState + 'cen.json'
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
        'text-halo-color': '#ffffff',
        'text-halo-width': 1,
        'text-color': 'rgb(20, 20, 20)'
      }
    });
    this.map.on('click', 'county_poly', (evt: MapMouseEvent) => this.countyClicked(evt));

    this.map.addSource('places_src', {
      type: 'geojson',
      data: this.datapath + '/assets/jsons/places_ok/places' + this.selectedState + '.json'
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

    this.selectedCounty = e.features[0].properties.GEOID.replace('DEMO ', '').replace('MAPTILER ', '');
    this.selectedCountyName = e.features[0].properties.NAME.replace('DEMO ', '').replace('MAPTILER ', '');
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
      data: this.datapath + '/assets/jsons/towns_ok/twp' + this.selectedCounty + '.json'
    });
    this.map.addSource('twp_label_src', {
      type: 'geojson',
      data: this.datapath + '/assets/jsons/towns_ok/twp' + this.selectedCounty + 'cen.json'
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
    const selectn: any[] = this.map.querySourceFeatures('twp_poly_src', {filter: ['==', 'GEOID', this.selectedTownshipGeoid]});
    let carray = [];

    for (let i = 0; i < selectn.length; i++) {
      const coords = selectn[i].geometry.coordinates;
      if (selectn[i].geometry.type === 'MultiPolygon') {
        for (let j = 0; j < coords.length; j++) {
          carray = carray.concat(coords[j][0]);
        }
      }
      if (selectn[i].geometry.type === 'Polygon') {
        carray = carray.concat(coords[0]);
      }
    }

    const bnds = carray.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new LngLatBounds(carray[0], carray[0]));

    this.map.fitBounds(bnds, {padding: 10});
    const placesfilter = ['all', ['==', 'COUSUBFP', this.selectedTownshipId], ['==', 'CountyID', this.selectedTownshipCnt]];
    this.map.setFilter('places_poly', placesfilter);
    this.map.setFilter('places_label', placesfilter);
    this.map.setLayoutProperty('places_poly', 'visibility', 'visible');
    this.map.setLayoutProperty('places_label', 'visibility', 'visible');
    const twpfilter = ['!in', 'GEOID', this.selectedTownshipGeoid];
    this.map.setFilter('twp_poly', twpfilter);
    this.map.setFilter('twp_label', twpfilter);
  }

  placeClicked(e) {
    const selectn: any[] = this.map.querySourceFeatures('places_src',
      {filter: ['all', ['==', 'GEOID', e.features[0].properties.GEOID], ['==', 'COUSUBFP', e.features[0].properties.COUSUBFP]]});
    let carray = [];
    for (let i = 0; i < selectn.length; i++) {
      const coords = selectn[i].geometry.coordinates;
      if (selectn[i].geometry.type === 'MultiPolygon') {
        for (let j = 0; j < coords.length; j++) {
          carray = carray.concat(coords[j][0]);
        }
      }
      if (selectn[i].geometry.type === 'Polygon') {
        carray = carray.concat(coords[0]);
      }
    }

    const bnds = carray.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new LngLatBounds(carray[0], carray[0]));
    this.map.fitBounds(bnds, {padding: 10});
    const html = '<strong>' + e.features[0].properties.NAMELSAD + '</strong><br />' + this.selectedTownshipName + '<br />' +
      this.selectedCountyName + ' County<br />' + this.selectedStateName;
    new Popup()
      .setLngLat(e.lngLat)
      .setHTML(html)
      .addTo(this.map);
  }

  viewCont() {
    this.map.fitBounds(this.mapvars.continental);
  }

  viewAlaska() {
    this.map.fitBounds(this.mapvars.alaska);
  }

  viewHawaii() {
    this.map.fitBounds(this.mapvars.hawaii);
  }
}
