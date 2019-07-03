import {Component, OnInit} from '@angular/core';
import {IControl, LngLat, LngLatBounds, Map, MapMouseEvent, Popup} from 'mapbox-gl';

@Component({
  selector: 'app-miles-map',
  templateUrl: './miles-map.component.html',
})
export class MilesMapComponent implements OnInit {

  map: Map;
  mapvars = {
    continental: new LngLatBounds(new LngLat(-124.90, 24.40), new LngLat(-66.90, 49.40)),
    alaska: new LngLatBounds(new LngLat(-187.66, 46), new LngLat(-129.9, 71.44)),
    hawaii: new LngLatBounds(new LngLat(-178.45, 18.86), new LngLat(-154.75, 28.52))
  };
  zoomControl: IControl;
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
    this.datapath = 'https://mpi-dev-proc.firebaseapp.com';
  }

  ngOnInit() {
  }

  onLoad(mapInst: Map) {
    this.map = mapInst;

    this.map.fitBounds(this.mapvars.continental, {padding: 10});
    this.addStates();
    this.zoomControl = {onAdd: evt => this.controlOnAdd(), onRemove: evt => this.controlOnRemove()};
    this.map.addControl(this.zoomControl, 'bottom-left');
    this.mapControl = {onAdd: evt => this.controlOnAddMap(), onRemove: evt => this.controlOnRemoveMap()};
    this.map.addControl(this.mapControl, 'top-right');
  }

  stateClicked(e) {
    const stateFips = e.features[0].properties.STATEFP.replace('DEMO ', '').replace('MAPTILER ', '');
    const stateName = e.features[0].properties.NAME.replace('DEMO ', '').replace('MAPTILER ', '');
    const bb = new LngLatBounds(
      new LngLat(e.features[0].properties.EXT_MIN_X, e.features[0].properties.EXT_MIN_Y),
      new LngLat(e.features[0].properties.EXT_MAX_X, e.features[0].properties.EXT_MAX_Y)
    );
    this.setStateSelected({fips: stateFips, name: stateName, bbox: bb});
  }

  countyClicked(e) {
    const cntyFips = e.features[0].properties.GEOID.replace('DEMO ', '').replace('MAPTILER ', '');
    const cntyName = e.features[0].properties.NAME.replace('DEMO ', '').replace('MAPTILER ', '') ;
    const bb = new LngLatBounds(
      new LngLat(e.features[0].properties.EXT_MIN_X, e.features[0].properties.EXT_MIN_Y),
      new LngLat(e.features[0].properties.EXT_MAX_X, e.features[0].properties.EXT_MAX_Y)
    );
    this.selectCounty({fips: cntyFips, name: cntyName, bbox: bb});
  }

  townshipClicked(e) {
    const townshipCnt = e.features[0].properties.CountyID;
    const townshipId = e.features[0].properties.COUSUBFP;
    const townshipGeoid = e.features[0].properties.GEOID;
    const townshipName = e.features[0].properties.NAMELSAD;
    const data = {cnty: townshipCnt, fips: townshipId, geoid: townshipGeoid, name: townshipName};
    this.selectTownship(data);
  }

  placeClicked(e) {
    const id = e.features[0].properties.GEOID;
    const cousub = e.features[0].properties.COUSUBFP;
    const plname = e.features[0].properties.NAMELSAD;
    const pt = e.lngLat;
    const pldata = {fips: id, twp: cousub, name: plname, point: pt};
    this.selectPlace(pldata);
  }

  setStateSelected(stateData) {
    this.unselectState();
    this.selectedState = stateData.fips;
    this.selectedStateName = stateData.name;
    this.map.fitBounds(stateData.bbox, {padding: 10});
    const filter = ['!in', 'STATEFP', this.selectedState, 'DEMO ' + this.selectedState, 'MAPTILER ' + this.selectedState];
    this.map.setFilter('states_poly', filter);
    this.unselectCounty();
    this.map.addSource('places_src', {
      type: 'geojson',
      data: this.datapath + '/assets/jsons/places_ok/places' + this.selectedState + '.json'
    });
    this.addCountiesByState();
    this.addPlacesByState();
  }

  addStates() {
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
  }

  addPlacesByState() {
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

  addCountiesByState() {
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
  }

  addTownshipByCounty() {
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

  unselectState() {
    if (this.selectedState !== '') {
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
    this.map.setFilter('states_poly', null);
    this.selectedState = '';
    this.selectedStateName = '';
  }

  unselectCounty() {
    if (this.selectedCounty !== '') {
      this.map.off('click', 'twp_poly', (evt: MapMouseEvent) => this.townshipClicked(evt));
      this.map.removeLayer('twp_poly');
      this.map.removeLayer('twp_label');
      this.map.removeSource('twp_poly_src');
      this.map.removeSource('twp_label_src');
    }
    this.selectedCounty = '';
    this.selectedCountyName = '';
  }

  unselectTownship() {
    if (this.selectedTownshipName !== '') {
      this.map.setFilter('places_poly', null);
      this.map.setFilter('places_label', null);
      this.map.setLayoutProperty('places_poly', 'visibility', 'none');
      this.map.setLayoutProperty('places_label', 'visibility', 'none');
    }
    this.selectedTownshipCnt = '';
    this.selectedTownshipId = '';
    this.selectedTownshipGeoid = '';
    this.selectedTownshipName = '';
  }

  selectCounty(countyData) {
    this.unselectTownship();
    this.unselectCounty();
    this.selectedCounty = countyData.fips;
    this.selectedCountyName = countyData.name ;
    this.map.fitBounds(countyData.bbox, {padding: 10});
    const filter = ['!in', 'GEOID', this.selectedCounty, 'DEMO ' + this.selectedCounty, 'MAPTILER ' + this.selectedCounty];
    this.map.setFilter('county_poly', filter);
    this.map.setFilter('county_label', filter);
    this.addTownshipByCounty();
  }

  selectTownship(twpData) {
    this.selectedTownshipCnt = twpData.cnty;
    this.selectedTownshipId = twpData.fips;
    this.selectedTownshipGeoid = twpData.geoid;
    this.selectedTownshipName = twpData.name;
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

  selectPlace(placeData) {
    const html = '<strong>' + placeData.name + '</strong><br />' + this.selectedTownshipName + '<br />' +
      this.selectedCountyName + ' County<br />' + this.selectedStateName;
    const selectn: any[] = this.map.querySourceFeatures('places_src',
      {filter: ['all', ['==', 'GEOID', placeData.fips], ['==', 'COUSUBFP', placeData.twp]]});
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
    new Popup()
      .setLngLat(placeData.point)
      .setHTML(html)
      .addTo(this.map);
  }

  viewCont() {
    this.map.fitBounds(this.mapvars.continental, {padding: 10});
    this.unselectState();
    this.unselectCounty();
    this.unselectTownship();
  }

  viewAlaska() {
    this.map.fitBounds(this.mapvars.alaska, {padding: 10});
    this.setStateSelected({fips: '02', name: 'Alaska', bbox: this.mapvars.alaska});
  }

  viewHawaii() {
    this.map.fitBounds(this.mapvars.hawaii, {padding: 10});
    this.setStateSelected({fips: '15', name: 'Hawaii', bbox: this.mapvars.hawaii});
  }

  controlOnAdd() {
    const container = document.createElement('div');

    container.id = 'zoom-buttons';
    const b1 = window.document.createElement('button');
    b1.className = 'mapboxgl-ctrl';
    b1.innerHTML = '<img src="/assets/images/map1_64.png"/>';
    b1.addEventListener('click', (e) => {
      this.viewCont();
      e.stopPropagation();
    });

    container.appendChild(b1);
    const b2 = window.document.createElement('button');
    b2.className = 'mapboxgl-ctrl';
    b2.innerHTML = '<img src="/assets/images/map2_64.png"/>';
    b2.addEventListener('click', (e) => {
      this.viewAlaska();
      e.stopPropagation();
    });

    container.appendChild(b2);
    const b3 = window.document.createElement('button');
    b3.className = 'mapboxgl-ctrl';
    b3.innerHTML = '<img src="/assets/images/map3_64.png"/>';
    b3.addEventListener('click', (e) => {
      this.viewHawaii();
      e.stopPropagation();
    });
    container.appendChild(b3);

    return container;
  }

  controlOnRemove() {
    const container = document.getElementById('zoom-buttons');
    if (container) {
      container.parentNode.removeChild(container);
    }
  }

  controlOnAddMap() {
    const container = document.createElement('div');

    container.id = 'map-buttons';
    const b1 = window.document.createElement('button');
    b1.className = 'map-ctrl';
    b1.innerHTML = '<i class="fa-road_regular text-size-24p text-white"></i>';
    b1.addEventListener('click', (e) => {
      this.viewCont();
      e.stopPropagation();
    });
    container.appendChild(b1);

    const b2 = window.document.createElement('button');
    b2.className = 'map-ctrl right';
    b2.innerHTML = '<i class="fa-satellite_regular text-size-24p text-white"></i>';
    b2.addEventListener('click', (e) => {
      this.viewAlaska();
      e.stopPropagation();
    });
    container.appendChild(b2);

    return container;
  }

  controlOnRemoveMap() {
    const container = document.getElementById('map-buttons');
    if (container) {
      container.parentNode.removeChild(container);
    }
  }
}
