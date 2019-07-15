import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {GeoJSONSource, IControl, LngLat, LngLatBounds, Map, MapMouseEvent, Popup} from 'mapbox-gl';
import {AppService} from '../../app.service';
import {Subscription} from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-miles-map',
  templateUrl: './miles-map.component.html',
})
export class MilesMapComponent implements OnInit, OnDestroy {

  map: Map;
  mapvars = {
    continental: new LngLatBounds(new LngLat(-124.90, 24.40), new LngLat(-66.90, 49.40)),
    alaska: new LngLatBounds(new LngLat(-187.66, 46), new LngLat(-129.9, 71.44)),
    hawaii: new LngLatBounds(new LngLat(-178.45, 18.86), new LngLat(-154.75, 28.52)),
    initial: new LngLatBounds(new LngLat(-79.77, 38.78), new LngLat(-71.78, 45.01)),
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
  addrdata: any[];
  timer: number;
  stateFillFilter;
  stateLineFilter;
  countyFillFilter;
  countyLineFilter;
  colors: any;
  statereg: any[];
  countyreg: any[];

  indicatorTxt: string;
  indicatorType: string;
  subscription: Subscription;

  constructor(private appService: AppService, private zone: NgZone) {
    this.selectedState = '';
    this.selectedStateName = '';
    this.selectedCounty = '';
    this.selectedCountyName = '';
    this.datapath = 'https://mpi-dev-proc.firebaseapp.com';
    this.addrdata = [];
    this.timer = 0;
    this.colors = {
      state_reg_fill: '#EAC6C8',
      state_reg_line: '#9F3C40',
      county_reg_fill: '#EAC6C8',
      county_reg_line: '#9F3C40',
      twp_reg_fill: '#EAC6C8',
      twp_reg_line: '#9F3C40',
      state_noreg_fill: '#BFD6BA',
      state_noreg_line: '#3E6E62',
      county_noreg_fill: '#BFD6BA',
      county_noreg_line: '#3E6E62',
      twp_noreg_fill: '#BFD6BA',
      twp_noreg_line: '#3E6E62'
    };
    this.statereg = ['01', '04', '09', '13', '20', '24', '34', '36', '41', '47'];
    this.countyreg = ['04012', '04013', '04025', '06009', '06029', '06039', '06065', '06073', '06099', '08059', '10003', '12007', '12011', '12015', '12017', '12019', '12031', '12043', '12057', '12071', '12073', '12081',
      '12083', '12099', '12101', '12103', '12117', '13015', '13035', '13089', '13113', '13121', '13127', '13135', '13139', '13211', '13247', '13285', '17031', '17089', '20209', '21117', '21151', '21223', '21225',
      '24031', '24033', '32003', '39017', '39025', '39035', '39061', '39085', '39093', '39095', '39099', '39113', '39151', '39153', '39155', '39165', '41011', '41029', '34001', '34003', '34005', '34007', '34009',
      '34011', '34013', '34015', '34017', '34019', '34021', '34023', '34025', '34027', '34029', '34031', '34033', '34035', '34037', '34039', '34041', '36001', '36003', '36005', '36007', '36009',
      '36011', '36013', '36015', '36017', '36019', '36021', '36023', '36025', '36027', '36029', '36031', '36033', '36035', '36037', '36039', '36041', '36043', '36045', '36047', '36049', '36051', '36053', '36055',
      '36057', '36059', '36061', '36063', '36065', '36067', '36069', '36071', '36073', '36075', '36077', '36079', '36081', '36083', '36085', '36087', '36089', '36091', '36093', '36095', '36097', '36099', '36101',
      '36103', '36105', '36107', '36109', '36111', '36113', '36115', '36117', '36119', '36121', '36123'];

    this.subscription = this.appService.getMessage().subscribe(message => {
      this.zone.run(() => {
        if (message.type == 'initMap') {
            this.viewCont();
        } else if (message.type == 'resizeMap') {
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

    this.stateFillFilter = ['match', ['get', 'STATEFP']];
    this.stateLineFilter = ['match', ['get', 'STATEFP']];
    for (let i = 0; i < this.statereg.length; i++) {
      this.stateFillFilter.push(this.statereg[i]);
      this.stateFillFilter.push(this.colors.state_reg_fill);
      this.stateFillFilter.push('DEMO ' + this.statereg[i]);
      this.stateFillFilter.push(this.colors.state_reg_fill);
      this.stateFillFilter.push('MAPTILER ' + this.statereg[i]);
      this.stateFillFilter.push(this.colors.state_reg_fill);
      this.stateLineFilter.push(this.statereg[i]);
      this.stateLineFilter.push(this.colors.state_reg_line);
      this.stateLineFilter.push('DEMO ' + this.statereg[i]);
      this.stateLineFilter.push(this.colors.state_reg_line);
      this.stateLineFilter.push('MAPTILER ' + this.statereg[i]);
      this.stateLineFilter.push(this.colors.state_reg_line);
    }
    this.stateFillFilter.push(this.colors.state_noreg_fill);
    this.stateLineFilter.push(this.colors.state_noreg_line);

    this.countyFillFilter = ['match', ['get', 'GEOID']];
    this.countyLineFilter = ['match', ['get', 'GEOID']];
    for (let i = 0; i < this.countyreg.length; i++) {
      this.countyFillFilter.push(this.countyreg[i]);
      this.countyFillFilter.push(this.colors.county_reg_fill);
      this.countyFillFilter.push('DEMO ' + this.countyreg[i]);
      this.countyFillFilter.push(this.colors.county_reg_fill);
      this.countyFillFilter.push('MAPTILER ' + this.countyreg[i]);
      this.countyFillFilter.push(this.colors.county_reg_fill);
      this.countyLineFilter.push(this.countyreg[i]);
      this.countyLineFilter.push(this.colors.county_reg_line);
      this.countyLineFilter.push('DEMO ' + this.countyreg[i]);
      this.countyLineFilter.push(this.colors.county_reg_line);
      this.countyLineFilter.push('MAPTILER ' + this.countyreg[i]);
      this.countyLineFilter.push(this.colors.county_reg_line);
    }
    this.countyFillFilter.push(this.colors.county_noreg_fill);
    this.countyLineFilter.push(this.colors.county_noreg_line);

    this.map.fitBounds(this.mapvars.initial, {padding: 10});
    this.addStates();
    this.zoomControl = {onAdd: evt => this.controlOnAdd(), onRemove: evt => this.controlOnRemove()};
    this.map.addControl(this.zoomControl, 'bottom-left');
    this.mapControl = {onAdd: evt => this.controlOnAddMap(), onRemove: evt => this.controlOnRemoveMap()};
    this.map.addControl(this.mapControl, 'top-right');
    this.map.loadImage('./assets/images/2216353-32.png', (error, image) => {
      if (error) { throw error; }
      this.map.addImage('pin', image);
    });
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
        'fill-color': this.stateFillFilter,
        'fill-outline-color': this.stateFillFilter,
        'fill-antialias': true,
        'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.55, 0.35],
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
        'line-color': this.stateLineFilter,
        'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 3, 2],
        'line-offset': ['case',
          ['boolean', ['feature-state', 'hover'], false],
          1.5,
          1
        ],
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
          'Montserrat Medium',
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
        'fill-color': this.countyFillFilter,
        'fill-outline-color': this.countyFillFilter,
        'fill-antialias': true,
        'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.75, 0.55],
      },
    });

    this.map.addLayer({
      id: 'county_line',
      type: 'line',
      source: 'county_poly_src',
      'source-layer': 'counties',
      layout: {
        visibility: 'visible'
      },
      paint: {
        'line-color': this.countyLineFilter,
        'line-width': ['case',
          ['boolean', ['feature-state', 'hover'], false],
          3,
          2
        ],
        'line-offset': ['case',
          ['boolean', ['feature-state', 'hover'], false],
          1.5,
          1
        ],
        'line-opacity': ['case',
          ['boolean', ['feature-state', 'hover'], false],
          1,
          0.5
        ]
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
          'Montserrat Medium'
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
          'Montserrat Medium'
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
    setTimeout(() => {
      if (this.selectedState === '34') {
        this.dropAddresses('nj_list2');
      }
      if (this.selectedState === '36') {
        this.dropAddresses('ny_list2');
      }
    }, 1000);

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
      this.map.removeLayer('county_line');
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
      if (this.map.getLayer('address')) {
        this.map.off('click', 'address', (evt: MapMouseEvent) => this.addressClicked(evt));
        this.map.removeLayer('address');
        this.map.removeSource('address_src');
      }
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
    this.map.setFilter('county_line', filter);
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

  dropAddresses(filename) {
    $.ajax({
      url: this.datapath + '/assets/jsons/addresses/' + filename + '.json',
      method: 'POST',
      success: (data) => {
        this.processSuccess(data);
      }
    });
  }

  processSuccess(data) {
    this.addrdata = [];
    const ub = this.map.getBounds().getNorth() - 0.01;
    for (let i = 0 ; i < data[0].data.length ; i++) {
      this.addrdata.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(data[0].data[i].Lng), ub]
        },
        properties : {
          address : data[0].data[i].Address,
          client : data[0].data[i].Client,
          latO : parseFloat(data[0].data[i].Lat),
          lngO : parseFloat(data[0].data[i].Lng),
          anim : 0
        }
      });
    }

    const dat: any = this.ptCalcData(0);
    this.map.addSource('address_src', {
      type: 'geojson',
      cluster: false,
      clusterRadius: 1,
      clusterMaxZoom: 0,
      data: dat,
    });

    this.map.addLayer({
      id: 'address',
      type: 'symbol',
      source: 'address_src',
      layout: {
        'icon-image': 'pin',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'icon-anchor': 'bottom'
      }
    });
    this.map.on('click', 'address', (evt: MapMouseEvent) => this.addressClicked(evt));
    requestAnimationFrame(ts => {
      this.resetTimer(ts);
    });
    this.animatePoints(0);
  }

  ptCalcData(timestamp) {
    const fallps = 15;
    const falltime = 2;
    const totaltime = this.addrdata.length / fallps;
    const time = (timestamp - this.timer) / 1000;
    const ub = this.map.getBounds().getNorth() + 0.01;
    if (time > 0) {
      let first = (time > falltime) ? Math.ceil((time - falltime) * fallps) : 0;
      const last = (time > totaltime) ? this.addrdata.length : Math.ceil(time * fallps);
      if (first > 0) {
        if (first > last) { first = last; }
        for (let i = first - 1; i >= 0; i--) {
          this.addrdata[i].geometry.coordinates[1] = this.addrdata[i].properties.latO;
          if (this.addrdata[i].properties.anim < 2) { this.addrdata[i].properties.anim = 2; } else { break; }
        }
      }
      let basetime = time - first / fallps;
      const timestep = 1 / fallps;
      for (let i = first; i < last; i++) {
        this.addrdata[i].geometry.coordinates[1] = ub - (ub - this.addrdata[i].properties.latO) * basetime / falltime;
        basetime -= timestep;
      }
    } else {
      for (let i = 0; i < this.addrdata.length; i++) {
        this.addrdata[i].geometry.coordinates[1] = ub;
      }
    }

    return {type: 'FeatureCollection', features: this.addrdata};
  }

  animatePoints(timestamp) {
    const x: any = this.ptCalcData(timestamp);
    (this.map.getSource('address_src') as GeoJSONSource).setData(x);
    const cnt = this.addrdata.length - 1;
    if (this.addrdata[cnt].properties.anim < 2) {
      requestAnimationFrame(ts => {
        this.animatePoints(ts);
      });
    }
  }

  addressClicked(e) {
    // e.stopPropagation();
    const html = '<strong>' + e.features[0].properties.address + '</strong><br /><strong>Client:</strong>' + e.features[0].properties.client;
    new Popup()
      .setLngLat(e.lngLat)
      .setHTML(html)
      .addTo(this.map);
  }

  resetTimer(timestamp) {
    this.timer = timestamp;
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
