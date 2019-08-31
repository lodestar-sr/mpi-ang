import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AnySourceData, Layer, LngLat, LngLatBounds, Map, MapMouseEvent, NavigationControl} from 'mapbox-gl';
import {environment} from '../../../../environments/environment';

declare var $: any;

@Component({
  selector: 'app-portfolio-map',
  templateUrl: './portfolio-map.component.html',
})
export class PortfolioMapComponent implements OnInit {

  @Output() clickedState: EventEmitter<any> = new EventEmitter();

  map: Map;
  mapvars: any;
  mapStates: any[];
  selectedState: string;
  selectedStateName: string;
  colors: any;
  statereg: any;
  datapath: string = environment.assetURL;

  constructor() {

    this.mapvars = {
      continental: new LngLatBounds(new LngLat(-124.90, 24.40), new LngLat(-66.90, 49.40)),
      alaska: new LngLatBounds(new LngLat(-187.66, 46), new LngLat(-129.9, 71.44)),
      hawaii: new LngLatBounds(new LngLat(-178.45, 18.86), new LngLat(-154.75, 28.52)),
      initial: new LngLatBounds(new LngLat(-79.77, 38.78), new LngLat(-71.78, 45.01)),
      highlightedStateId: -1,
      highlightedCountyId: -1,
      highlightedSubCountyId: -1,
      highlightedPlaceId: -1,
      currentStyle: 'light_custom',
      styles: {
        satellite: 'mapbox://styles/mapbox/satellite-v9',
        light: 'mapbox://styles/mapbox/light-v10',
        flwright: 'mapbox://styles/sdalakov/cjxy9jkk10na81co5pa8shr1n',
        light_custom: 'mapbox://styles/sdalakov/cjy0ou41g03do1cmueyianmm7'
      },
      layers: {
        state: {
          polysource: {
            name: 'state_poly_src',
            config: {
              type: 'geojson',
              generateId: true,
              data: this.datapath + '/assets/jsons/states_poly.json'
            }
          },
          labelsource: {
            name: 'state_label_src',
            config: {
              type: 'geojson',
              generateId: true,
              data: this.datapath + '/assets/jsons/states_lab.json'
            }
          },
          leadersource: {
            name: 'state_leader_src',
            config: {
              type: 'geojson',
              generateId: true,
              data: this.datapath + '/assets/jsons/states_line.json'
            }
          },
          poly: {
            id: 'state_poly',
            type: 'fill',
            source: 'state_poly_src',
            layout: {
              visibility: 'visible'
            },
            paint: {
              'fill-color': '#cceeff',
              'fill-outline-color': '#0088cc',
              'fill-antialias': true,
              'fill-opacity': 0.35
            }
          },
          label: {
            id: 'state_label',
            type: 'symbol',
            source: 'state_label_src',
            layout: {
              visibility: 'visible',
              'text-allow-overlap': true,
              'text-ignore-placement': true,
              'text-field': '{label}',
              'text-transform': 'uppercase',
              'text-font': [
                'Montserrat Medium'
              ],
              'text-anchor': ['case',
                ['match', ['get', 'Leader'], 1, true, false], 'left',
                'center'],
              'text-size': 15
            },
            paint: {
              'text-color': 'rgb(20, 20, 20)'
            }
          },
          leader: {
            id: 'state_leader',
            type: 'line',
            source: 'state_leader_src',
            layout: {
              visibility: 'visible',
            },
            paint: {
              'line-color': 'rgb(20, 20, 20)'
            }
          }
        }
      }
    };
    this.mapStates = [{
      state_fips: '',
      state_name: '',
      bbox: this.mapvars.continental,
      padding: 20
    }];
    this.selectedState = '';
    this.selectedStateName = '';
    this.colors = {
      noreg_fill: '#BFD6BA',
      reg_fill1: '#EAC6C8',
      reg_fill2: '#EE999E',
      reg_fill3: '#F06767',
      reg_line: '#9F3C40',
      reg_line_more: '#FFFF40',
      noreg_line: '#3E6E62',
      county_reg_fill: '#EAC6C8',
      county_reg_line: '#9F3C40',
      county_reg_line_more: '#FFFF40',
      twp_reg_fill: '#EAC6C8',
      twp_reg_line: '#9F3C40',
      state_noreg_fill: '#BFD6BA',
      state_noreg_line: '#3E6E62',
      county_noreg_fill: '#BFD6BA',
      county_noreg_line: '#3E6E62',
      twp_noreg_fill: '#BFD6BA',
      twp_noreg_line: '#3E6E62',
      twp_noreg_sel_fill: '#3E6E62',
      twp_noreg_sel_line: '#BFD6BA',
      twp_reg_sel_fill: '#9F3C40',
      twp_reg_sel_line: '#EAC6C8'
    };
  }

  ngOnInit() {
  }

  onLoad(mapInst: Map) {
    this.map = mapInst;
    this.generateFilters();
  }

  initMap() {
    this.map.fitBounds(this.mapvars.continental, {padding: 10});
    this.addLayers();
    this.map.on('click', this.mapvars.layers.state.poly.id, (evt: MapMouseEvent) => this.stateClicked(evt));
    this.map.on('mousemove', this.mapvars.layers.state.poly.id, (evt: MapMouseEvent) => this.stateIn(evt));
    this.map.on('mouseleave', this.mapvars.layers.state.poly.id, (evt: MapMouseEvent) => this.stateOut(evt));
    this.map.addControl(new NavigationControl(), 'bottom-right');
    const viewControl = {onAdd: evt => this.controlOnAdd(), onRemove: evt => this.controlOnRemove()};
    const hoverView = {onAdd: evt => this.hoverControlOnAdd(), onRemove: evt => this.hoverControlOnRemove()};
    const styleControl = {onAdd: evt => this.styleControlOnAdd(), onRemove: evt => this.styleControlOnRemove()} ;
    this.map.addControl(viewControl, 'bottom-left');
    this.map.addControl(styleControl, 'top-right');
    this.map.addControl(hoverView, 'top-right');
    this.map.on('style.load', () => {
      this.addLayers();
    });
  }

  generateFilters() {
    $.ajax({
      method: 'GET',
      url: this.datapath + '/assets/jsons/scorecard.json',
      data: {},
      success: (sccard) => {
        this.processFilters(sccard);
      }
    });
  }

  processFilters(sccard) {
    this.statereg = {};
    for (let i = 0 ; i < sccard.state_scorecards.scorecard_data.length ; i++) {
      this.statereg[sccard.state_scorecards.scorecard_data[i].fips_state] = sccard.state_scorecards.scorecard_data[i].state_total;
    }
    $.ajax({
      method: 'GET',
      url: this.mapvars.layers.state.labelsource.config.data,
      success: (json) => {
        this.processData(json);
      }
    });
  }

  processData(json) {
    for (let i = 0 ; i < json.features.length ; i++) {
      if (json.features[i].properties.Leader == 1) {
        json.features[i].properties.label = json.features[i].properties.STUSPS + ' ' + this.statereg[json.features[i].properties.GEOID];
      } else {
        json.features[i].properties.label = this.statereg[json.features[i].properties.GEOID];
      }
    }
    this.mapvars.layers.state.labelsource.config.data = json;
    this.initMap();
  }

  stateClicked(e) {
    let stateFips = e.features[0].properties.GEOID;
    let stateName = e.features[0].properties.NAME;
    const bb = this.map.getBounds();
    if (this.selectedState === stateFips) {
      stateFips = '';
      stateName = '';
    }
    this.addMapState({state_fips: stateFips, state_name: stateName, bbox: bb, padding: '0px'});
    this.updateMapState();
    this.clickedState.emit({state_fips: stateFips, state_name: stateName});
  }

  stateIn(e) {
    if (e.features.length > 0) {
      if (this.mapvars.highlightedStateId > -1) {
        this.map.setFeatureState({
          source: this.mapvars.layers.state.polysource.name,
          sourceLayer: this.mapvars.layers.state.poly['source-layer'],
          id: this.mapvars.highlightedStateId
          }, {hover: false});
      }
      this.mapvars.highlightedStateId = e.features[0].id;
      this.map.setFeatureState({
        source: this.mapvars.layers.state.polysource.name,
        sourceLayer: this.mapvars.layers.state.poly['source-layer'],
        id: this.mapvars.highlightedStateId
      }, { hover: true});
      document.getElementById('hover-state').innerText = e.features[0].properties.NAME;
    }
  }

  stateOut(e) {
    if (this.mapvars.highlightedStateId > -1) {
      this.map.setFeatureState({
        source: this.mapvars.layers.state.polysource.name,
        sourceLayer: this.mapvars.layers.state.poly['source-layer'],
        id: this.mapvars.highlightedStateId
      }, {hover: false});
    }
    this.mapvars.highlightedStateId = -1;
    document.getElementById('hover-state').innerText = this.selectedStateName;
  }

  addLayers() {
    if (!this.map.getSource(this.mapvars.layers.state.polysource.name)) {
      this.map.addSource(this.mapvars.layers.state.polysource.name, this.mapvars.layers.state.polysource.config as AnySourceData);
      this.map.addSource(this.mapvars.layers.state.labelsource.name, this.mapvars.layers.state.labelsource.config as AnySourceData);
      this.map.addSource(this.mapvars.layers.state.leadersource.name, this.mapvars.layers.state.leadersource.config as AnySourceData);
    }
    this.map.addLayer(this.mapvars.layers.state.poly as Layer);
    this.map.addLayer(this.mapvars.layers.state.label as Layer);
    this.map.addLayer(this.mapvars.layers.state.leader as Layer);
  }

  viewCont() {
    this.addMapState({state_fips: '', state_name: '', county_fips: '', county_name: '', township_fips: '', township_name: '', bbox: this.mapvars.continental, padding: 20});
    this.updateMapState();
  }

  viewAlaska() {
    this.addMapState({state_fips: '02', state_name: 'Alaska', bbox: this.mapvars.alaska, padding: 20});
    this.updateMapState();
  }

  viewHawaii() {
    this.addMapState({state_fips: '15', state_name: 'Hawaii', bbox: this.mapvars.hawaii, padding: 20});
    this.updateMapState();
  }

  setStyleSatellite() {
    if (this.mapvars.currentStyle !== 'satellite') {
      this.map.setStyle(this.mapvars.styles.satellite);
      this.mapvars.currentStyle = 'satellite';
    }
  }

  setStyleRoadmap() {
    if (this.mapvars.currentStyle !== 'light_custom') {
      this.map.setStyle(this.mapvars.styles.light_custom);
      this.mapvars.currentStyle = 'light_custom';
    }
  }

  controlOnAdd() {
    const container = document.createElement('div');

    container.id = 'zoom-buttons';
    const b1 = window.document.createElement('button');
    b1.className = 'mapboxgl-ctrl';
    b1.innerHTML = '<img class="portfolio-map-btn" src="/assets/images/map1_64.png"/>';
    b1.addEventListener('click', (e) => {
      this.viewCont();
      e.stopPropagation();
    });
    container.appendChild(b1);

    const b2 = window.document.createElement('button');
    b2.className = 'mapboxgl-ctrl';
    b2.innerHTML = '<img class="portfolio-map-btn" src="/assets/images/map2_64.png"/>';
    b2.addEventListener('click', (e) => {
      this.viewAlaska();
      e.stopPropagation();
    });
    container.appendChild(b2);

    const b3 = window.document.createElement('button');
    b3.className = 'mapboxgl-ctrl';
    b3.innerHTML = '<img class="portfolio-map-btn" src="/assets/images/map3_64.png"/>';
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

  styleControlOnAdd() {
    const container = document.createElement('div');
    container.id = 'style-buttons';
    const b1 = window.document.createElement('button');
    b1.className = 'mapboxgl-ctrl';
    b1.style.clear = 'none';
    b1.innerHTML = 'R';
    b1.addEventListener('click', (e) => {
      this.setStyleRoadmap();
      e.stopPropagation();
    });
    container.appendChild(b1);
    const b2 = window.document.createElement('button');
    b2.className = 'mapboxgl-ctrl';
    b2.style.clear = 'none';
    b2.innerHTML = 'S';
    b2.addEventListener('click', (e) => {
      this.setStyleSatellite();
      e.stopPropagation();
    });
    container.appendChild(b2);
    return container;
  }

  styleControlOnRemove() {
    const container = document.getElementById('style-buttons');
    if (container) {
      container.parentNode.removeChild(container);
    }
  }

  hoverControlOnAdd() {
    const container = document.createElement('div');
    container.id = 'hover-wrapper';
    container.className = 'mapboxgl-ctrl';
    const b1 = window.document.createElement('div');
    b1.id = 'hover-state';
    b1.className = 'state-level';
    container.appendChild(b1);
    return container;
  }

  hoverControlOnRemove() {
    const container = document.getElementById('hover-wrapper');
    if (container) {
      container.parentNode.removeChild(container);
    }
  }

  addMapState(data) {
    this.mapStates.unshift(data);
  }

  updateMapState() {
    const state = this.mapStates[0];
    if (state.state_fips !== this.selectedState) {
      if (state.state_fips === '') {
        this.mapvars.layers.state.poly['fill-color'] = '#cceeff';
        this.map.setPaintProperty(this.mapvars.layers.state.poly.id, 'fill-color', '#cceeff');
      } else {
        this.mapvars.layers.state.poly['fill-color'] = ['case', ['==', ['get', 'GEOID'], state.state_fips], '#006699', '#cceeff'];
        this.map.setPaintProperty(this.mapvars.layers.state.poly.id, 'fill-color', ['case', ['==', ['get', 'GEOID'], state.state_fips], '#006699', '#cceeff']);
      }
    }
    this.map.fitBounds(state.bbox, {padding: state.padding});
    this.selectedState = state.state_fips;
    this.selectedStateName = state.state_name;
    document.getElementById('hover-state').innerText = this.selectedStateName;
  }

  deleteMapState() {
    this.mapStates.shift();
  }

  back() {
    this.deleteMapState();
    this.updateMapState();
  }
}
