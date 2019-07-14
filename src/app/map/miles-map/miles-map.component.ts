import {Component, NgZone, OnInit} from '@angular/core';
import {IControl, LngLat, LngLatBounds, Map, MapMouseEvent, Popup} from 'mapbox-gl';
import {AppService} from '../../app.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-miles-map',
  templateUrl: './miles-map.component.html',
})
export class MilesMapComponent implements OnInit {

  map: Map;
  mapvars = {
    continental: new LngLatBounds(new LngLat(-124.90, 24.40), new LngLat(-66.90, 49.40)),
    alaska: new LngLatBounds(new LngLat(-187.66, 46), new LngLat(-129.9, 71.44)),
    hawaii: new LngLatBounds(new LngLat(-178.45, 18.86), new LngLat(-154.75, 28.52)),
    highlightedStateId: -1,
    highlightedCountyId: -1,
    highlightedTownsipId: -1,
    highlightedPlaceId: -1
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

  indicatorTxt: string;
  indicatorType: string;
  subscription: Subscription;

  constructor(private appService: AppService, private zone: NgZone) {
    this.selectedState = '';
    this.selectedStateName = '';
    this.selectedCounty = '';
    this.selectedCountyName = '';
    this.datapath = 'https://mpi-dev-proc.firebaseapp.com';
    this.subscription = this.appService.getMessage().subscribe(message => {
      this.zone.run(() => {
        if (message.type == 'initMap') {
            this.viewCont();
        } else if(message.type == 'resizeMap') {
            this.resize();
        }
      });
    });
  }

  ngOnInit() {
    this.indicatorTxt = '';
    this.indicatorType = '';
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
    const cntyName = e.features[0].properties.NAME.replace('DEMO ', '').replace('MAPTILER ', '');
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

  stateIn(e) {
    if (e.features.length > 0) {
      if (this.mapvars.highlightedStateId > -1) {
        this.map.setFeatureState({
          source: 'states_src',
          sourceLayer: 'states',
          id: this.mapvars.highlightedStateId
        }, {hover: false});
      }
      this.mapvars.highlightedStateId = e.features[0].id;
      this.map.setFeatureState({
          source: 'states_src',
          sourceLayer: 'states',
          id: this.mapvars.highlightedStateId
        }, {hover: true});

      const tmp = e.features[0].properties.NAME.replace('DEMO ', '').replace('MAPTILER ', '');
      this.updateIndicator('state', tmp);
    }
  }

  stateOut(e) {
    if (this.mapvars.highlightedStateId > -1) {
      this.map.setFeatureState({
        source: 'states_src',
        sourceLayer: 'states',
        id: this.mapvars.highlightedStateId
      }, {hover: false});
    }
    this.mapvars.highlightedStateId = -1;
    this.updateIndicator('state', '');
  }

  countyIn(e) {
    if (e.features.length > 0) {
      if (this.mapvars.highlightedCountyId > -1) {
        this.map.setFeatureState({
          source: 'county_poly_src',
          sourceLayer: 'counties',
          id: this.mapvars.highlightedCountyId
        }, {hover: false});
      }
      this.mapvars.highlightedCountyId = e.features[0].id;
      this.map.setFeatureState({
        source: 'county_poly_src',
        sourceLayer: 'counties',
        id: this.mapvars.highlightedCountyId
      }, {hover: true});
      const tmp = e.features[0].properties.NAME.replace('DEMO ', '').replace('MAPTILER ', '');
      this.updateIndicator('county', tmp);
    }
  }

  countyOut(e) {
    if (this.mapvars.highlightedCountyId > -1) {
      this.map.setFeatureState({
        source: 'county_poly_src',
        sourceLayer: 'counties',
        id: this.mapvars.highlightedCountyId
      }, {hover: false});
    }
    this.mapvars.highlightedCountyId = -1;
    this.updateIndicator('county', '');
  }

  townshipIn(e) {
    if (e.features.length > 0) {
      if (this.mapvars.highlightedTownsipId > -1) {
        this.map.setFeatureState({
          source: 'twp_poly_src',
          id: this.mapvars.highlightedTownsipId,
        }, {hover: false});
      }
      this.mapvars.highlightedTownsipId = e.features[0].id;
      this.map.setFeatureState({
        source: 'twp_poly_src',
        id: this.mapvars.highlightedTownsipId
      }, {hover: true});
      this.updateIndicator('town', e.features[0].properties.NAMELSAD);
    }
  }

  townshipOut(e) {
    if (this.mapvars.highlightedTownsipId > -1) {
      this.map.setFeatureState({
        source: 'twp_poly_src',
        id: this.mapvars.highlightedTownsipId
      }, {hover: false});
    }
    this.mapvars.highlightedTownsipId = -1;
    this.updateIndicator('town', '');
  }

  placeIn(e) {
    if (e.features.length > 0) {
      if (this.mapvars.highlightedPlaceId > -1) {
        this.map.setFeatureState({
          source: 'places_src',
          id: this.mapvars.highlightedPlaceId
        }, {hover: false});
      }
      this.mapvars.highlightedPlaceId = e.features[0].id;
      this.map.setFeatureState({
        source: 'places_src',
        id: this.mapvars.highlightedPlaceId
      }, {hover: true});
      this.updateIndicator('place', e.features[0].properties.NAMELSAD);
    }
  }

  placeOut(e) {
    if (this.mapvars.highlightedPlaceId > -1) {
      this.map.setFeatureState({
        source: 'places_src',
        id: this.mapvars.highlightedPlaceId
      }, {hover: false});
    }
    this.mapvars.highlightedPlaceId = -1;
    this.updateIndicator('place', '');
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
        'fill-color': ['match', ['get', 'STATEFP'],
          '06', '#ff9900', '09', '#ff9900', '10', '#ff9900', '17', '#ff9900', '18', '#ff9900', '20', '#ff9900', '21', '#ff9900', '23', '#ff9900', '24', '#ff9900', '25', '#ff9900',
          '26', '#ff9900', '27', '#ff9900', '28', '#ff9900', '29', '#ff9900', '31', '#ff9900', '33', '#ff9900', '34', '#ff9900', '36', '#ff9900', '38', '#ff9900', '39', '#ff9900',
          '42', '#ff9900', '44', '#ff9900', '50', '#ff9900', '51', '#ff9900', '54', '#ff9900', '55', '#ff9900',
          'DEMO 06', '#ff9900', 'DEMO 09', '#ff9900', 'DEMO 10', '#ff9900', 'DEMO 17', '#ff9900', 'DEMO 18', '#ff9900', 'DEMO 20', '#ff9900', 'DEMO 21', '#ff9900', 'DEMO 23', '#ff9900',
          'DEMO 24', '#ff9900', 'DEMO 25', '#ff9900', 'DEMO 26', '#ff9900', 'DEMO 27', '#ff9900', 'DEMO 28', '#ff9900', 'DEMO 29', '#ff9900', 'DEMO 31', '#ff9900', 'DEMO 33', '#ff9900',
          'DEMO 34', '#ff9900', 'DEMO 36', '#ff9900', 'DEMO 38', '#ff9900', 'DEMO 39', '#ff9900', 'DEMO 42', '#ff9900', 'DEMO 44', '#ff9900', 'DEMO 50', '#ff9900', 'DEMO 51', '#ff9900',
          'DEMO 54', '#ff9900', 'DEMO 55', '#ff9900',
          'MAPTILER 06', '#ff9900', 'MAPTILER 09', '#ff9900', 'MAPTILER 10', '#ff9900', 'MAPTILER 17', '#ff9900', 'MAPTILER 18', '#ff9900', 'MAPTILER 20', '#ff9900',
          'MAPTILER 21', '#ff9900', 'MAPTILER 23', '#ff9900', 'MAPTILER 24', '#ff9900', 'MAPTILER 25', '#ff9900', 'MAPTILER 26', '#ff9900', 'MAPTILER 27', '#ff9900',
          'MAPTILER 28', '#ff9900', 'MAPTILER 29', '#ff9900', 'MAPTILER 31', '#ff9900', 'MAPTILER 33', '#ff9900', 'MAPTILER 34', '#ff9900', 'MAPTILER 36', '#ff9900',
          'MAPTILER 38', '#ff9900', 'MAPTILER 39', '#ff9900', 'MAPTILER 42', '#ff9900', 'MAPTILER 44', '#ff9900', 'MAPTILER 50', '#ff9900', 'MAPTILER 51', '#ff9900',
          'MAPTILER 54', '#ff9900', 'MAPTILER 55', '#ff9900', '#8B4513'
        ],
        'fill-outline-color': '#8B4513',
        'fill-antialias': true,
        'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.25, 0.35],
      },
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
        'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 3, 2],
        'line-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0.5],
      },
    });
    this.map.on('click', 'states_poly', (evt: MapMouseEvent) => this.stateClicked(evt));
    this.map.on('mousemove', 'states_poly', (evt: MapMouseEvent) => this.stateIn(evt));
    this.map.on('mouseleave', 'states_poly', (evt: MapMouseEvent) => this.stateOut(evt));
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
        'fill-color': ['case', ['boolean', ['feature-state', 'hover'], false], '#33eeee', '#33CCCC'],
        'fill-outline-color': '#ffffff',
        'fill-antialias': true,
        'fill-opacity': 0.9
      }
    });

    this.map.addLayer({
      id: 'places_line',
      type: 'line',
      source: 'places_src',
      layout: {
        visibility: 'none'
      },
      paint: {
        'line-color': '#ffffff',
        'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 3, 1],
        'line-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0.5],
      },
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
    this.map.on('mousemove', 'places_poly', (evt: MapMouseEvent) => this.placeIn(evt));
    this.map.on('mouseleave', 'places_poly', (evt: MapMouseEvent) => this.placeOut(evt));
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
        'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.40, 0.50],
      },
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
    this.map.on('mousemove', 'county_poly', (evt: MapMouseEvent) => this.countyIn(evt));
    this.map.on('mouseleave', 'county_poly', (evt: MapMouseEvent) => this.countyOut(evt));
  }

  addTownshipByCounty() {
    this.map.addSource('twp_poly_src', {
      type: 'geojson',
      generateId: true,
      data: this.datapath + '/assets/jsons/local_authorities/local' + this.selectedCounty + '.json'
    });
    this.map.addSource('twp_label_src', {
      type: 'geojson',
      data: this.datapath + '/assets/jsons/local_authorities/local' + this.selectedCounty + 'cen.json'
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
        'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.60, 0.75],
      },
    });

    this.map.addLayer({
      id: 'twp_line',
      type: 'line',
      source: 'twp_poly_src',
      layout: {
        visibility: 'visible'
      },
      paint: {
        'line-color': '#8B4513',
        'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 2, 1],
        'line-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0.5],
      },
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
    this.map.on('mousemove', 'twp_poly', (evt: MapMouseEvent) => this.townshipIn(evt));
    this.map.on('mouseleave', 'twp_poly', (evt: MapMouseEvent) => this.townshipOut(evt));
  }

  setStateSelected(stateData) {
    this.unselectState();
    this.selectedState = stateData.fips;
    this.selectedStateName = stateData.name;
    this.map.fitBounds(stateData.bbox, {padding: 10});
    const filter = ['!in', 'STATEFP', this.selectedState, 'DEMO ' + this.selectedState, 'MAPTILER ' + this.selectedState];
    this.map.setFilter('states_poly', filter);
    this.unselectCounty();
    this.unselectTownship();
    this.map.addSource('places_src', {
      type: 'geojson',
      generateId: true,
      data: this.datapath + '/assets/jsons/places_ok/places' + this.selectedState + '.json'
    });
    this.addCountiesByState();
    this.addPlacesByState();

    this.appService.sendMessage({
      type: 'state',
      name: this.selectedStateName,
      id: this.selectedState,
    });
  }

  unselectState() {
    if (this.selectedState !== '') {
      this.map.off('click', 'county_poly', (evt: MapMouseEvent) => this.countyClicked(evt));
      this.map.off('mousemove', 'county_poly', (evt: MapMouseEvent) => this.countyIn(evt));
      this.map.off('mouseleave', 'county_poly', (evt: MapMouseEvent) => this.countyOut(evt));
      this.map.removeLayer('county_poly');
      this.map.removeLayer('county_label');
      this.map.removeSource('county_poly_src');
      this.map.removeSource('county_label_src');
      this.map.off('click', 'places_poly', (evt: MapMouseEvent) => this.placeClicked(evt));
      this.map.off('mousemove', 'places_poly', (evt: MapMouseEvent) => this.placeIn(evt));
      this.map.off('mouseleave', 'places_poly', (evt: MapMouseEvent) => this.placeOut(evt));
      this.map.removeLayer('places_poly');
      this.map.removeLayer('places_line');
      this.map.removeLayer('places_label');
      this.map.removeSource('places_src');
    }
    this.map.setFilter('states_poly', null);
    this.selectedState = '';
    this.selectedStateName = '';
    // this.indicatorTxt = this.selectedStateName;
  }

  selectCounty(countyData) {
    this.unselectTownship();
    this.unselectCounty();
    this.selectedCounty = countyData.fips;
    this.selectedCountyName = countyData.name;
    this.map.fitBounds(countyData.bbox, {padding: 10});
    const filter = ['!in', 'GEOID', this.selectedCounty, 'DEMO ' + this.selectedCounty, 'MAPTILER ' + this.selectedCounty];
    this.map.setFilter('county_poly', filter);
    this.map.setFilter('county_label', filter);
    this.addTownshipByCounty();

    this.appService.sendMessage({
      type: 'county',
      name: this.selectedCountyName,
      id: this.selectedCounty,
    });
  }

  unselectCounty() {
    if (this.selectedCounty !== '') {
      this.map.off('click', 'twp_poly', (evt: MapMouseEvent) => this.townshipClicked(evt));
      this.map.off('mousemove', 'twp_poly', (evt: MapMouseEvent) => this.townshipIn(evt));
      this.map.off('mouseleave', 'twp_poly', (evt: MapMouseEvent) => this.townshipOut(evt));
      this.map.removeLayer('twp_poly');
      this.map.removeLayer('twp_line');
      this.map.removeLayer('twp_label');
      this.map.removeSource('twp_poly_src');
      this.map.removeSource('twp_label_src');
    }
    this.selectedCounty = '';
    this.selectedCountyName = '';
    // this.indicatorTxt = this.selectedCountyName;
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
    this.map.setFilter('places_line', placesfilter);
    this.map.setFilter('places_label', placesfilter);
    this.map.setLayoutProperty('places_poly', 'visibility', 'visible');
    this.map.setLayoutProperty('places_line', 'visibility', 'visible');
    this.map.setLayoutProperty('places_label', 'visibility', 'visible');
    const twpfilter = ['!in', 'GEOID', this.selectedTownshipGeoid];
    this.map.setFilter('twp_poly', twpfilter);
    this.map.setFilter('twp_line', twpfilter);
    this.map.setFilter('twp_label', twpfilter);

    this.appService.sendMessage({
      type: 'town',
      name: this.selectedTownshipName,
      id: this.selectedTownshipId,
    });
  }

  unselectTownship() {
    if (this.selectedTownshipName !== '') {
      this.map.setFilter('places_poly', null);
      this.map.setFilter('places_line', null);
      this.map.setFilter('places_label', null);
      this.map.setLayoutProperty('places_poly', 'visibility', 'none');
      this.map.setLayoutProperty('places_line', 'visibility', 'none');
      this.map.setLayoutProperty('places_label', 'visibility', 'none');
    }
    this.selectedTownshipCnt = '';
    this.selectedTownshipId = '';
    this.selectedTownshipGeoid = '';
    this.selectedTownshipName = '';
    // this.indicatorTxt = this.selectedTownshipName;
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
    this.appService.sendMessage({type: 'gotoHome'});
  }

  viewAlaska() {
    this.map.fitBounds(this.mapvars.alaska, {padding: 10});
    this.setStateSelected({fips: '02', name: 'Alaska', bbox: this.mapvars.alaska});
    this.appService.sendMessage({type: 'gotoHome'});
  }

  viewHawaii() {
    this.map.fitBounds(this.mapvars.hawaii, {padding: 10});
    this.setStateSelected({fips: '15', name: 'Hawaii', bbox: this.mapvars.hawaii});
    this.appService.sendMessage({type: 'gotoHome'});
  }

  resize() {
    this.map.resize();
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
    b1.innerHTML = '<i class="fa-road_regular text-white"></i>';
    b1.addEventListener('click', (e) => {

      e.stopPropagation();
    });
    container.appendChild(b1);

    const b2 = window.document.createElement('button');
    b2.className = 'map-ctrl right';
    b2.innerHTML = '<i class="fa-satellite_regular text-white"></i>';
    b2.addEventListener('click', (e) => {

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

  updateIndicator(type, str) {
    if (str != this.indicatorTxt) {
      this.zone.run(() => {
        this.indicatorTxt = str;
        this.indicatorType = type;
      });
    }
  }
}
