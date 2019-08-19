import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {AnySourceData, GeoJSONSource, IControl, Layer, LngLat, LngLatBounds, Map, MapMouseEvent, Popup} from 'mapbox-gl';
import {AppService} from '../../app.service';
import {Subscription} from 'rxjs';
import {environment} from '../../../environments/environment';

declare var $: any;

@Component({
  selector: 'app-miles-map',
  templateUrl: './miles-map.component.html',
})
export class MilesMapComponent implements OnInit, OnDestroy {

  mapStates: any[];
  map: Map;
  datapath: string = environment.assetURL;
  mapvars = {
    continental: new LngLatBounds(new LngLat(-124.90, 24.40), new LngLat(-66.90, 49.40)),
    alaska: new LngLatBounds(new LngLat(-187.66, 46), new LngLat(-129.9, 71.44)),
    hawaii: new LngLatBounds(new LngLat(-178.45, 18.86), new LngLat(-154.75, 28.52)),
    initial: new LngLatBounds(new LngLat(-79.77, 38.78), new LngLat(-71.78, 45.01)),
    highlightedStateId: -1,
    highlightedCountyId: -1,
    highlightedTownsipId: -1,
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
        source: {
          name: 'states_src',
          config: {
            type: 'vector',
            tiles: [this.datapath + '/assets/tiles/states/{z}/{x}/{y}.pbf']
          }
        },
        poly: {
          id: 'states_poly',
          type: 'fill',
          source: 'states_src',
          'source-layer': 'states',
          layout: {
            visibility: 'visible'
          },
          paint: {
            'fill-color': {},
            'fill-outline-color': {},
            'fill-antialias': true,
            'fill-opacity': ['case',
              ['boolean', ['feature-state', 'hover'], false],
              0.55,
              0.35
            ]
          },
        },
        border: {
          id: 'states_line',
          type: 'line',
          source: 'states_src',
          'source-layer': 'states',
          layout: {
            visibility: 'visible'
          },
          paint: {
            'line-color': {},
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
        }
      },
      county: {
        polysource: {
          name: 'county_poly_src',
          config: {
            type: 'vector',
            tiles: [this.datapath + '/assets/tiles/counties/01/{z}/{x}/{y}.pbf']
          }
        },
        labelsource: {
          name: 'county_label_src',
          config: {
            type: 'geojson',
            data: this.datapath + '/assets/jsons/counties_ok/cnt01cen.json'
          }
        },
        poly: {
          id: 'county_poly',
          type: 'fill',
          source: 'county_poly_src',
          'source-layer': 'counties',
          layout: {
            visibility: 'none'
          },
          paint: {
            'fill-color': {},
            'fill-outline-color': {},
            'fill-antialias': true,
            'fill-opacity': ['case',
              ['boolean', ['feature-state', 'hover'], false],
              0.75,
              0.55
            ]
          },
        },
        border: {
          id: 'county_line',
          type: 'line',
          source: 'county_poly_src',
          'source-layer': 'counties',
          layout: {
            visibility: 'none'
          },
          paint: {
            'line-color': {},
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
          },
        },
        label: {
          id: 'county_label',
          type: 'symbol',
          source: 'county_label_src',
          layout: {
            visibility: 'none',
            'text-field': '{NAME}',
            'text-transform': 'uppercase',
            'text-font': [
              'Montserrat Medium'
            ],
            'text-size': 15
          },
          paint: {
            'text-halo-color': '#ffffff',
            'text-halo-width': 1,
            'text-color': 'rgb(20, 20, 20)'
          },
        }
      },
      township: {
        polysource: {
          name: 'twp_poly_src',
          config: {
            type: 'geojson',
            generateId: true,
            data: this.datapath + '/assets/jsons/local_authorities/local01001.json'
          }
        },
        labelsource: {
          name: 'twp_label_src',
          config: {
            type: 'geojson',
            generateId: true,
            data: this.datapath + '/assets/jsons/local_authorities/local01001cen.json'
          }
        },
        poly: {
          id: 'twp_poly',
          type: 'fill',
          source: 'twp_poly_src',
          layout: {
            visibility: 'none'
          },
          paint: {
            'fill-color': {},
            'fill-outline-color': {},
            'fill-antialias': true,
            'fill-opacity': ['case',
              ['boolean', ['feature-state', 'hover'], false], 0.58,
              0.7
            ]
          }
        },
        border: {
          id: 'twp_line',
          type: 'line',
          source: 'twp_poly_src',
          layout: {
            visibility: 'none'
          },
          paint: {
            'line-color': {},
            'line-width': ['case',
              ['boolean', ['feature-state', 'hover'], false],
              2,
              1
            ],
            'line-offset': ['case',
              ['boolean', ['feature-state', 'hover'], false],
              1,
              0.5
            ],
            'line-opacity': ['case',
              ['boolean', ['feature-state', 'hover'], false],
              1,
              0.8
            ]
          }
        },
        label: {
          id: 'twp_label',
          type: 'symbol',
          source: 'twp_label_src',
          layout: {
            visibility: 'none',
            'text-field': '{NAMELSAD}',
            'text-transform': 'uppercase',
            'text-font': [
              'Montserrat Medium'
            ],
            'text-size': 13
          },
          paint: {
            'text-color': 'rgb(20, 20, 20)'
          }
        }
      },
      address: {
        source: {
          name: 'address_src',
          config: {
            type: 'geojson',
            cluster: false,
            clusterRadius: 1,
            clusterMaxZoom: 0,
            data: {
              type: 'FeatureCollection',
              features: []
            }
          }
        },
        icon: {
          id: 'address',
          type: 'symbol',
          source: 'address_src',
          layout: {
            'icon-image': 'pin',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-anchor': 'bottom'
          }
        }
      }
    }
  };
  zoomControl: IControl;
  mapControl: IControl;
  selectedState: string;
  selectedStateName: string;
  selectedCounty: string;
  selectedCountyName: string;
  selectedTownship: any;
  selectedTownshipName: any;
  addrdata: any[];
  timer: number;
  stateFillFilter;
  stateLineFilter;
  countyFillFilter;
  countyLineFilter;
  townshipFillFilter;
  townshipLineFilter;
  colors: any;
  statereg: any[];
  countyreg: any;
  townshipreg: any;

  indicatorTxt: string;
  indicatorType: string;
  subscription: Subscription;

  constructor(private appService: AppService, private zone: NgZone) {
    this.mapStates = [{
      state_fips : '',
      state_name: '',
      county_fips: '',
      county_name: '',
      township_fips: '',
      township_name: '',
      bbox: this.mapvars.continental
    }];
    this.selectedState = '';
    this.selectedStateName = '';
    this.selectedCounty = '';
    this.selectedCountyName = '';
    this.selectedTownship = '';
    this.selectedTownshipName = '';
    this.addrdata = [];
    this.timer = 0;
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
    this.statereg = ['01', '04', '09', '13', '20', '24', '34', '36', '41', '47'];
    this.countyreg = {
      '04': ['04012', '04013', '04025'],
      '06': ['06009', '06029', '06039', '06065', '06073', '06099'],
      '08': ['08059'],
      10: ['10003'],
      12: ['12007', '12011', '12015', '12017', '12019', '12031', '12043', '12057', '12071', '12073', '12081', '12083', '12099', '12101', '12103', '12117'],
      13: ['13015', '13035', '13089', '13113', '13121', '13127', '13135', '13139', '13211', '13247', '13285'],
      17: ['17031', '17089'],
      20: ['20209'],
      21: ['21117', '21151', '21223', '21225'],
      24: ['24031', '24033'],
      32: ['32003'],
      34: ['34001', '34003', '34005', '34007', '34009', '34011', '34013', '34015', '34017', '34019', '34021', '34023', '34025', '34027', '34029', '34031', '34033', '34035', '34037', '34039',
        '34041'],
      36: ['36001', '36003', '36005', '36007', '36009', '36011', '36013', '36015', '36017', '36019', '36021', '36023', '36025', '36027', '36029', '36031', '36033', '36035', '36037', '36039',
        '36041', '36043', '36045', '36047', '36049', '36051', '36053', '36055', '36057', '36059', '36061', '36063', '36065', '36067', '36069', '36071', '36073', '36075', '36077', '36079',
        '36081', '36083', '36085', '36087', '36089', '36091', '36093', '36095', '36097', '36099', '36101', '36103', '36105', '36107', '36109', '36111', '36113', '36115', '36117', '36119',
        '36121', '36123'],
      39: ['39017', '39025', '39035', '39061', '39085', '39093', '39095', '39099', '39113', '39151', '39153', '39155', '39165'],
      41: ['41011', '41029']
    };
    this.townshipreg = {
      '06': {
        '06065' : ['0650076', '0616350', '0604758']
      },
      36: {
        36001 : ['3600131104', '3600117343', '3600150672']
      }
    };

    this.subscription = this.appService.getMessage().subscribe(message => {
      this.zone.run(() => {
        if (message.type === 'initMap') {
          this.viewCont();
        } else if (message.type === 'resizeMap') {
          this.resize();
        } else if (message.type === 'back') {
          this.back();
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
    this.generateFilters();
    this.map.fitBounds(this.mapvars.continental, {padding: 10});

    this.addLayers();
    this.map.on('click', this.mapvars.layers.state.poly.id, (evt: MapMouseEvent) => this.stateClicked(evt));
    this.map.on('mousemove', this.mapvars.layers.state.poly.id, (evt: MapMouseEvent) => this.stateIn(evt));
    this.map.on('mouseleave', this.mapvars.layers.state.poly.id, (evt: MapMouseEvent) => this.stateOut(evt));
    this.map.on('click', this.mapvars.layers.county.poly.id, (evt: MapMouseEvent) => this.countyClicked(evt));
    this.map.on('mousemove', this.mapvars.layers.county.poly.id, (evt: MapMouseEvent) => this.countyIn(evt));
    this.map.on('mouseleave', this.mapvars.layers.county.poly.id, (evt: MapMouseEvent) => this.countyOut(evt));
    this.map.on('click', this.mapvars.layers.township.poly.id, (evt: MapMouseEvent) => this.townshipClicked(evt));
    this.map.on('mousemove', this.mapvars.layers.township.poly.id, (evt: MapMouseEvent) => this.townshipIn(evt));
    this.map.on('mouseleave', this.mapvars.layers.township.poly.id, (evt: MapMouseEvent) => this.townshipOut(evt));
    this.map.on('click', this.mapvars.layers.address.icon.id, (evt: MapMouseEvent) => this.addressClicked(evt));

    this.zoomControl = {onAdd: evt => this.controlOnAdd(), onRemove: evt => this.controlOnRemove()};
    this.map.addControl(this.zoomControl, 'bottom-left');
    this.mapControl = {onAdd: evt => this.styleControlOnAdd(), onRemove: evt => this.styleControlOnRemove()};
    this.map.addControl(this.mapControl, 'top-right');

    this.map.on('style.load', () => {
      this.addLayers();
    });
  }

  generateFilters() {
    const sfilllist = [];
    const slin1list = [];
    const slin2list = [];
    for (let i = 0; i < this.statereg.length; i++) {
      sfilllist.push(this.statereg[i]);
      sfilllist.push('DEMO ' + this.statereg[i]);
      sfilllist.push('MAPTILER ' + this.statereg[i]);
//                if (countyreg[statereg[i]]||townshipreg[statereg[i]]) {
//                    slin2list.push(statereg[i]);
//                    slin2list.push('DEMO '+statereg[i]);
//                    slin2list.push('MAPTILER '+statereg[i]);
//                } else {
      slin1list.push(this.statereg[i]);
      slin1list.push('DEMO ' + this.statereg[i]);
      slin1list.push('MAPTILER ' + this.statereg[i]);
//                }
    }
    for (const stateid in this.countyreg) {
      slin2list.push(stateid);
      slin2list.push('DEMO ' + stateid);
      slin2list.push('MAPTILER ' + stateid);
    }
    for (const stateid in this.townshipreg) {
      if (slin2list.indexOf(stateid) < 0) {
        slin2list.push(stateid);
        slin2list.push('DEMO ' + stateid);
        slin2list.push('MAPTILER ' + stateid);
      }
    }
    this.stateFillFilter = ['case',
      ['match', ['get', 'STATEFP'], sfilllist, true, false], this.colors.reg_fill1,
      this.colors.noreg_fill
    ];
    this.stateLineFilter = ['case',
      ['match', ['get', 'STATEFP'], slin2list, true, false], this.colors.reg_line_more,
      ['match', ['get', 'STATEFP'], slin1list, true, false], this.colors.reg_line,
      this.colors.noreg_line
    ];
    this.mapvars.layers.state.poly.paint['fill-color'] = this.stateFillFilter;
    this.mapvars.layers.state.poly.paint['fill-outline-color'] = this.stateFillFilter;
    this.mapvars.layers.state.border.paint['line-color'] = this.stateLineFilter;

    const cfill1list = [];
    const cfill2list = [];
    const cline1list = [];
    const cline2list = [];
    for (const stateid in this.countyreg) {
      for (let j = 0 ; j < this.countyreg[stateid].length ; j++) {
        if (this.statereg.indexOf(stateid) > -1) {
          cfill2list.push(this.countyreg[stateid][j]);
          cfill2list.push('DEMO ' + this.countyreg[stateid][j]);
          cfill2list.push('MAPTILER ' + this.countyreg[stateid][j]);
        } else {
          cfill1list.push(this.countyreg[stateid][j]);
          cfill1list.push('DEMO ' + this.countyreg[stateid][j]);
          cfill1list.push('MAPTILER ' + this.countyreg[stateid][j]);
        }
        if (this.townshipreg[stateid] && this.townshipreg[stateid][this.countyreg[stateid][j]]) {
          cline1list.push(this.countyreg[stateid][j]);
          cline1list.push('DEMO ' + this.countyreg[stateid][j]);
          cline1list.push('MAPTILER ' + this.countyreg[stateid][j]);
        } else {
          cline2list.push(this.countyreg[stateid][j]);
          cline2list.push('DEMO ' + this.countyreg[stateid][j]);
          cline2list.push('MAPTILER ' + this.countyreg[stateid][j]);
        }
      }
    }
    this.countyFillFilter = ['case',
      ['match', ['get', 'GEOID'], cfill2list, true, false], this.colors.reg_fill2,
      ['match', ['get', 'GEOID'], cfill1list, true, false], this.colors.reg_fill1,
      ['match', ['get', 'STATEFP'], sfilllist, true, false], this.colors.reg_fill1,
      this.colors.noreg_fill
    ];
    this.countyLineFilter = ['case',
      ['match', ['get', 'GEOID'], cline1list, true, false], this.colors.reg_line_more,
      ['match', ['get', 'GEOID'], cline2list, true, false], this.colors.reg_line,
      ['match', ['get', 'STATEFP'], sfilllist, true, false], this.colors.reg_line,
      this.colors.noreg_line
    ];
    this.mapvars.layers.county.poly.paint['fill-color'] = this.countyFillFilter;
    this.mapvars.layers.county.poly.paint['fill-outline-color'] = this.countyFillFilter;
    this.mapvars.layers.county.border.paint['line-color'] = this.countyFillFilter;

    const tfill1list = [];
    const tfill2list = [];
    const tfill3list = [];
    for (const stateid in this.townshipreg) {
      console.log (stateid);
      for (const countyid in this.townshipreg[stateid]) {
        console.log (countyid);
        for (let j = 0 ; j < this.townshipreg[stateid][countyid].length ; j++) {
          if (cfill2list.indexOf(countyid) > -1) {
            tfill3list.push(this.townshipreg[stateid][countyid][j]);
          } else if (cfill1list.indexOf(this.townshipreg[stateid][countyid]) > -1 || sfilllist.indexOf(stateid) > -1) {
            tfill2list.push(this.townshipreg[stateid][countyid][j]);
          } else {
            tfill1list.push(this.townshipreg[stateid][countyid][j]);
          }
        }
      }
    }

    this.townshipFillFilter = ['case'];
    this.townshipLineFilter = ['case'];
    if (tfill3list.length > 0) {
      this.townshipFillFilter.push(['match', ['get', 'GEOID'], tfill3list, true, false]);
      this.townshipFillFilter.push(this.colors.reg_fill3);
      this.townshipLineFilter.push(['match', ['get', 'GEOID'], tfill3list, true, false]);
      this.townshipLineFilter.push(this.colors.reg_line);
    }
    if (tfill2list.length > 0) {
      this.townshipFillFilter.push(['match', ['get', 'GEOID'], tfill2list, true, false]);
      this.townshipFillFilter.push(this.colors.reg_fill2);
      this.townshipLineFilter.push(['match', ['get', 'GEOID'], tfill2list, true, false]);
      this.townshipLineFilter.push(this.colors.reg_line);
    }
    if (tfill1list.length > 0) {
      this.townshipFillFilter.push(['match', ['get', 'GEOID'], tfill1list, true, false]);
      this.townshipFillFilter.push(this.colors.reg_fill1);
      this.townshipLineFilter.push(['match', ['get', 'GEOID'], tfill1list, true, false]);
      this.townshipLineFilter.push(this.colors.reg_line);
    }
    if (cfill2list.length > 0) {
      this.townshipFillFilter.push(['match', ['get', 'CountyID'], cfill2list, true, false]);
      this.townshipFillFilter.push(this.colors.reg_fill2);
      this.townshipLineFilter.push(['match', ['get', 'CountyID'], cfill2list, true, false]);
      this.townshipLineFilter.push(this.colors.reg_line);
    }
    if (cfill1list.length > 0) {
      this.townshipFillFilter.push(['match', ['get', 'CountyID'], cfill1list, true, false]);
      this.townshipFillFilter.push(this.colors.reg_fill1);
      this.townshipLineFilter.push(['match', ['get', 'CountyID'], cfill1list, true, false]);
      this.townshipLineFilter.push(this.colors.reg_line);
    }
    if (sfilllist.length > 0) {
      this.townshipFillFilter.push(['match', ['get', 'STATEFP'], sfilllist, true, false]);
      this.townshipFillFilter.push(this.colors.reg_fill1);
      this.townshipLineFilter.push(['match', ['get', 'STATEFP'], sfilllist, true, false]);
      this.townshipLineFilter.push(this.colors.reg_line);
    }
    this.townshipFillFilter.push(this.colors.noreg_fill);
    this.townshipLineFilter.push(this.colors.noreg_line);

    this.mapvars.layers.township.poly.paint['fill-color'] = this.townshipFillFilter;
    this.mapvars.layers.township.poly.paint['fill-outline-color'] = this.townshipFillFilter;
    this.mapvars.layers.township.border.paint['line-color'] = this.townshipLineFilter;
  }

  stateClicked(e) {
    const stateFips = e.features[0].properties.STATEFP.replace('DEMO ', '').replace('MAPTILER ', '');
    const stateName = e.features[0].properties.NAME.replace('DEMO ', '').replace('MAPTILER ', '');
    const bb = new LngLatBounds(
      new LngLat(e.features[0].properties.EXT_MIN_X, e.features[0].properties.EXT_MIN_Y),
      new LngLat(e.features[0].properties.EXT_MAX_X, e.features[0].properties.EXT_MAX_Y)
    );
    this.addMapState({state_fips: stateFips, state_name: stateName, county_fips: '', county_name: '', township_fips: '', township_name: '', bbox: bb});
    this.updateMapState();
  }

  countyClicked(e) {
    const cntyFips = e.features[0].properties.GEOID.replace('DEMO ', '').replace('MAPTILER ', '');
    const cntyName = e.features[0].properties.NAME.replace('DEMO ', '').replace('MAPTILER ', '');
    const bb = new LngLatBounds(
      new LngLat(e.features[0].properties.EXT_MIN_X, e.features[0].properties.EXT_MIN_Y),
      new LngLat(e.features[0].properties.EXT_MAX_X, e.features[0].properties.EXT_MAX_Y)
    );
    this.addMapState({state_fips: this.selectedState, state_name: this.selectedStateName, county_fips: cntyFips, county_name: cntyName, township_fips: '', township_name: '', bbox: bb});
    this.updateMapState();
  }

  townshipClicked(e) {
    const townshipGeoid = e.features[0].properties.GEOID;
    const townshipName = e.features[0].properties.NAMELSAD;

    if (townshipGeoid === this.selectedTownship) {
      const bounds = this.map.getBounds();
      this.addMapState({state_fips: this.selectedState, state_name: this.selectedStateName, county_fips: this.selectedCounty, county_name: this.selectedCountyName, township_fips: '', township_name: '', bbox: bounds});
      this.updateMapState();
    } else {
      const selectn: any[] = this.map.querySourceFeatures(this.mapvars.layers.township.polysource.name, {filter: ['==', 'GEOID', townshipGeoid]});
      let carray = [];
      for (let i = 0 ; i < selectn.length ; i++) {
        const coords = selectn[i].geometry.coordinates ;
        if (selectn[i].geometry.type === 'MultiPolygon') {
          for (let j = 0 ; j < coords.length ; j++) {
            carray = carray.concat(coords[j][0]);
          }
        }
        if (selectn[i].geometry.type === 'Polygon') {
          carray = carray.concat(coords[0]);
        }
      }
      const bounds = carray.reduce((bnds, coord) => {
        return bnds.extend(coord);
      }, new LngLatBounds(carray[0], carray[0]));
      this.addMapState({state_fips: this.selectedState, state_name: this.selectedStateName, county_fips: this.selectedCounty, county_name: this.selectedCountyName, township_fips: townshipGeoid, township_name: townshipName, bbox: bounds});
      this.updateMapState();
    }
  }

  stateIn(e) {
    if (e.features.length > 0) {
      if (this.mapvars.highlightedStateId > -1) {
        this.map.setFeatureState({
          source: this.mapvars.layers.state.source.name,
          sourceLayer: this.mapvars.layers.state.poly['source-layer'],
          id: this.mapvars.highlightedStateId,
        }, {hover: false});
      }
      this.mapvars.highlightedStateId = e.features[0].id;
      this.map.setFeatureState({
        source: this.mapvars.layers.state.source.name,
        sourceLayer: this.mapvars.layers.state.poly['source-layer'],
        id: this.mapvars.highlightedStateId,
      }, {hover: true});

      const tmp = e.features[0].properties.NAME.replace('DEMO ', '').replace('MAPTILER ', '');
      this.updateIndicator('state', tmp);
    }
  }

  stateOut(e) {
    if (this.mapvars.highlightedStateId > -1) {
      this.map.setFeatureState({
        source: this.mapvars.layers.state.source.name,
        sourceLayer: this.mapvars.layers.state.poly['source-layer'],
        id: this.mapvars.highlightedStateId,
      }, {hover: false});
    }
    this.mapvars.highlightedStateId = -1;
    this.updateIndicator('state', '');
  }

  countyIn(e) {
    if (e.features.length > 0) {
      if (this.mapvars.highlightedCountyId > -1) {
        this.map.setFeatureState({
            source: this.mapvars.layers.county.polysource.name,
            sourceLayer: this.mapvars.layers.county.poly['source-layer'],
            id: this.mapvars.highlightedCountyId,
          }, {hover: false}
        );
      }
      this.mapvars.highlightedCountyId = e.features[0].id;
      this.map.setFeatureState({
        source: this.mapvars.layers.county.polysource.name,
        sourceLayer: this.mapvars.layers.county.poly['source-layer'],
        id: this.mapvars.highlightedCountyId,
      }, {hover: true});
      const tmp = e.features[0].properties.NAME.replace('DEMO ', '').replace('MAPTILER ', '');
      this.updateIndicator('county', tmp);
    }
  }

  countyOut(e) {
    if (this.mapvars.highlightedCountyId > -1) {
      this.map.setFeatureState({
        source: this.mapvars.layers.county.polysource.name,
        sourceLayer: this.mapvars.layers.county.poly['source-layer'],
        id: this.mapvars.highlightedCountyId,
      }, {hover: false});
    }
    this.mapvars.highlightedCountyId = -1;
    this.updateIndicator('county', '');
  }

  townshipIn(e) {
    if (e.features.length > 0) {
      if (this.mapvars.highlightedTownsipId > -1) {
        this.map.setFeatureState({source: this.mapvars.layers.township.polysource.name, id: this.mapvars.highlightedTownsipId}, {hover: false});
      }
      this.mapvars.highlightedTownsipId = e.features[0].id;
      this.map.setFeatureState({source: this.mapvars.layers.township.polysource.name, id: this.mapvars.highlightedTownsipId}, {hover: true});
      this.updateIndicator('town', e.features[0].properties.NAMELSAD);
    }
  }

  townshipOut(e) {
    if (this.mapvars.highlightedTownsipId > -1) {
      this.map.setFeatureState({source: this.mapvars.layers.township.polysource.name, id: this.mapvars.highlightedTownsipId}, {hover: false});
    }
    this.mapvars.highlightedTownsipId = -1;
    this.updateIndicator('town', '');
  }

  addLayers() {
    if (!this.map.getSource(this.mapvars.layers.state.source.name)) {
      this.map.addSource(this.mapvars.layers.state.source.name, this.mapvars.layers.state.source.config as AnySourceData);
      this.map.addSource(this.mapvars.layers.county.polysource.name, this.mapvars.layers.county.polysource.config as AnySourceData);
      this.map.addSource(this.mapvars.layers.county.labelsource.name, this.mapvars.layers.county.labelsource.config as AnySourceData);
      this.map.addSource(this.mapvars.layers.township.polysource.name, this.mapvars.layers.township.polysource.config as AnySourceData);
      this.map.addSource(this.mapvars.layers.township.labelsource.name, this.mapvars.layers.township.labelsource.config as AnySourceData);
    }
    this.map.addLayer(this.mapvars.layers.state.poly as Layer);
    this.map.addLayer(this.mapvars.layers.state.border as Layer);
    this.map.addLayer(this.mapvars.layers.county.poly as Layer);
    this.map.addLayer(this.mapvars.layers.county.border as Layer);
    this.map.addLayer(this.mapvars.layers.county.label as Layer);
    this.map.addLayer(this.mapvars.layers.township.poly as Layer);
    this.map.addLayer(this.mapvars.layers.township.border as Layer);
    this.map.addLayer(this.mapvars.layers.township.label as Layer);
    if (!this.map.hasImage('pin')) {
      this.map.loadImage('./assets/images/2216353-32.png', (error, image) => {
        if (error) {
          throw error;
        }
        this.map.addImage('pin', image);
      });
    }
    if (this.addrdata.length > 0) {
      if (!(this.map.getSource(this.mapvars.layers.address.source.name) as GeoJSONSource)) {
        this.map.addSource(this.mapvars.layers.address.source.name, this.mapvars.layers.address.source.config as AnySourceData);
      }
      (this.map.getSource(this.mapvars.layers.address.source.name) as GeoJSONSource).setData({type: 'FeatureCollection', features: this.addrdata});
      this.map.addLayer(this.mapvars.layers.address.icon as Layer);
    }
  }

  viewCont() {
    this.addMapState({state_fips: '', state_name: '', county_fips: '', county_name: '', township_fips: '', township_name: '', bbox: this.mapvars.continental});
    this.updateMapState();
    this.appService.sendMessage({type: 'gotoHome'});
  }

  viewAlaska() {
    this.addMapState({state_fips: '02', state_name: 'Alaska', county_fips: '', county_name: '', township_fips: '', township_name: '', bbox: this.mapvars.alaska});
    this.updateMapState();
    this.appService.sendMessage({type: 'gotoHome'});
  }

  viewHawaii() {
    this.addMapState({state_fips: '15', state_name: 'Hawaii', county_fips: '', county_name: '', township_fips: '', township_name: '', bbox: this.mapvars.hawaii});
    this.updateMapState();
    this.appService.sendMessage({type: 'gotoHome'});
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

  styleControlOnAdd() {
    const container = document.createElement('div');

    container.id = 'map-buttons';
    const b1 = window.document.createElement('button');
    b1.className = 'map-ctrl';
    b1.innerHTML = '<i class="fa-road_light text-white"></i>';
    b1.addEventListener('click', (e) => {
      this.setStyleRoadmap();
      e.stopPropagation();
    });
    container.appendChild(b1);

    const b2 = window.document.createElement('button');
    b2.className = 'map-ctrl right';
    b2.innerHTML = '<i class="fa-satellite_light text-white"></i>';
    b2.addEventListener('click', (e) => {
      this.setStyleSatellite();
      e.stopPropagation();
    });
    container.appendChild(b2);

    return container;
  }

  styleControlOnRemove() {
    const container = document.getElementById('map-buttons');
    if (container) {
      container.parentNode.removeChild(container);
    }
  }

  dropAddresses(filename) {
    $.ajax({
      url: this.datapath + '/assets/jsons/addresses/' + filename + '.json',
      method: 'GET',
      success: (data) => {
        this.processSuccess(data);
      }
    });
  }

  processSuccess(data) {
    this.addrdata = [];
    const ub = this.map.getBounds().getNorth() - 0.01;
    for (let i = 0; i < data[0].data.length; i++) {
      this.addrdata.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(data[0].data[i].Lng), ub]
        },
        properties: {
          address: data[0].data[i].Address,
          client: data[0].data[i].Client,
          latO: parseFloat(data[0].data[i].Lat),
          lngO: parseFloat(data[0].data[i].Lng),
          anim: 0
        }
      });
    }

    const dat: any = this.ptCalcData(0);
    if (!this.map.getSource(this.mapvars.layers.address.source.name)) {
      this.map.addSource(this.mapvars.layers.address.source.name, this.mapvars.layers.address.source.config as AnySourceData);
    }
    (this.map.getSource(this.mapvars.layers.address.source.name) as GeoJSONSource).setData(this.ptCalcData(0) as GeoJSON.FeatureCollection);
    this.map.addLayer(this.mapvars.layers.address.icon as Layer);
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
        if (first > last) {
          first = last;
        }
        for (let i = first - 1; i >= 0; i--) {
          this.addrdata[i].geometry.coordinates[1] = this.addrdata[i].properties.latO;
          if (this.addrdata[i].properties.anim < 2) {
            this.addrdata[i].properties.anim = 2;
          } else {
            break;
          }
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
    (this.map.getSource(this.mapvars.layers.address.source.name) as GeoJSONSource).setData(x);
    const cnt = this.addrdata.length - 1;
    if (this.addrdata[cnt].properties.anim < 2) {
      requestAnimationFrame(ts => {
        this.animatePoints(ts);
      });
    }
  }

  addressClicked(e) {
    const html = '<strong>' + e.features[0].properties.address + '</strong><br /><strong>Client:</strong>' + e.features[0].properties.client;
    new Popup()
      .setLngLat(e.lngLat)
      .setHTML(html)
      .addTo(this.map);
  }

  resetTimer(timestamp) {
    this.timer = timestamp;
  }

  updateIndicator(type, str) {
    if (str !== this.indicatorTxt) {
      this.zone.run(() => {
        this.indicatorTxt = str;
        this.indicatorType = type;
      });
    }
  }

  addMapState(data) {
    this.mapStates.push(data);
  }

  updateMapState() {
    const state = this.mapStates[this.mapStates.length - 1];

    if (!state) {
      return;
    }

    if (state.state_fips !== this.selectedState) {
      if (this.addrdata.length > 0) {
        this.map.removeLayer(this.mapvars.layers.address.icon.id);
        this.map.removeSource(this.mapvars.layers.address.source.name);
        this.addrdata = [];
      }
      if (state.state_fips === '') {
        delete(this.mapvars.layers.state.poly['filter']);
        this.map.setFilter(this.mapvars.layers.state.poly.id, null);
        this.map.setLayoutProperty(this.mapvars.layers.county.poly.id, 'visibility', 'none');
        this.map.setLayoutProperty(this.mapvars.layers.county.border.id, 'visibility', 'none');
        this.map.setLayoutProperty(this.mapvars.layers.county.label.id, 'visibility', 'none');
      } else {
        this.mapvars.layers.state.poly['filter'] = ['!in', 'STATEFP', state.state_fips, 'DEMO ' + state.state_fips, 'MAPTILER ' + state.state_fips];
        this.map.setFilter( this.mapvars.layers.state.poly.id, this.mapvars.layers.state.poly['filter']);
        const tiles = [this.datapath + '/assets/tiles/counties/' + state.state_fips + '/{z}/{x}/{y}.pbf'];
        if (tiles !== this.mapvars.layers.county.polysource.config.tiles) {
          this.mapvars.layers.county.polysource.config.tiles = tiles;
          this.mapvars.layers.county.labelsource.config.data = this.datapath + '/assets/jsons/counties_ok/cnt' + state.state_fips + 'cen.json';
          this.map.removeLayer(this.mapvars.layers.county.poly.id);
          this.map.removeLayer(this.mapvars.layers.county.border.id);
          this.map.removeSource(this.mapvars.layers.county.polysource.name);
          this.mapvars.layers.county.poly.layout.visibility = 'visible';
          this.mapvars.layers.county.border.layout.visibility = 'visible';
          this.mapvars.layers.county.label.layout.visibility = 'visible';
          this.map.addSource(this.mapvars.layers.county.polysource.name, this.mapvars.layers.county.polysource.config as AnySourceData);
          this.map.addLayer(this.mapvars.layers.county.poly as Layer);
          this.map.addLayer(this.mapvars.layers.county.border as Layer);
          (this.map.getSource(this.mapvars.layers.county.labelsource.name) as GeoJSONSource).setData(this.mapvars.layers.county.labelsource.config.data);
        }
        this.map.setLayoutProperty(this.mapvars.layers.county.poly.id, 'visibility', 'visible');
        this.map.setLayoutProperty(this.mapvars.layers.county.border.id, 'visibility', 'visible');
        this.map.setLayoutProperty(this.mapvars.layers.county.label.id, 'visibility', 'visible');
      }

      this.appService.sendMessage({
        type: 'state',
        name: state.state_name,
        id: state.state_fips,
      });
    }

    if (state.county_fips !== this.selectedCounty) {
      let filter;
      if (state.county_fips !== '') {
        filter = ['!in', 'GEOID', state.county_fips, 'DEMO ' + state.county_fips, 'MAPTILER ' + state.county_fips];
        const path = this.datapath + '/assets/jsons/local_authorities/local' + state.county_fips + '.json';
        const pathlab = this.datapath + '/assets/jsons/local_authorities/local' + state.county_fips + 'cen.json';
        this.mapvars.layers.township.polysource.config.data = path;
        this.mapvars.layers.township.labelsource.config.data = pathlab;
        (this.map.getSource(this.mapvars.layers.township.polysource.name) as GeoJSONSource).setData(path);
        (this.map.getSource(this.mapvars.layers.township.labelsource.name) as GeoJSONSource).setData(pathlab);
        this.mapvars.layers.township.poly.layout.visibility = 'visible';
        this.mapvars.layers.township.border.layout.visibility = 'visible';
        this.mapvars.layers.township.label.layout.visibility = 'visible';
        this.mapvars.layers.county.poly['filter'] = filter;
        this.mapvars.layers.county.border['filter'] = filter;
        this.mapvars.layers.county.label['filter'] = filter;
      } else {
        filter = null ;
        this.mapvars.layers.township.poly.layout.visibility = 'none';
        this.mapvars.layers.township.border.layout.visibility = 'none';
        this.mapvars.layers.township.label.layout.visibility = 'none';
        delete(this.mapvars.layers.county.poly['filter']);
        delete(this.mapvars.layers.county.border['filter']);
        delete(this.mapvars.layers.county.label['filter']);
      }
      this.map.setFilter(this.mapvars.layers.county.poly.id, filter);
      this.map.setFilter(this.mapvars.layers.county.border.id, filter);
      this.map.setFilter(this.mapvars.layers.county.label.id, filter);
      this.mapvars.layers.township.poly.paint['fill-color'] = this.townshipFillFilter;
      this.mapvars.layers.township.poly.paint['fill-outline-color'] = this.townshipFillFilter;
      this.mapvars.layers.township.poly.paint['fill-opacity'] = ['case',
        ['boolean', ['feature-state', 'hover'], false], 0.58,
        0.7
      ];
      this.mapvars.layers.township.border.paint['line-color'] = this.townshipLineFilter;
      this.map.setLayoutProperty(this.mapvars.layers.township.poly.id, 'visibility', this.mapvars.layers.township.poly.layout.visibility);
      this.map.setLayoutProperty(this.mapvars.layers.township.border.id, 'visibility', this.mapvars.layers.township.border.layout.visibility);
      this.map.setLayoutProperty(this.mapvars.layers.township.label.id, 'visibility', this.mapvars.layers.township.label.layout.visibility);

      this.appService.sendMessage({
        type: 'county',
        name: state.county_name,
        id: state.county_fips,
      });
    }

    if (state.township_fips !== this.selectedTownship) {
      if (state.township_fips !== '') {
        this.mapvars.layers.township.poly.paint['fill-opacity'] = ['case',
          ['==', ['get', 'GEOID'], state.township_fips], 0.9,
          ['boolean', ['feature-state', 'hover'], false], 0.58,
          0.7
        ];
      } else {
        this.mapvars.layers.township.poly.paint['fill-color'] = this.townshipFillFilter;
        this.mapvars.layers.township.poly.paint['fill-outline-color'] = this.townshipFillFilter;
        this.mapvars.layers.township.poly.paint['fill-opacity'] = ['case',
          ['boolean', ['feature-state', 'hover'], false], 0.58,
          0.7
        ];
        this.mapvars.layers.township.border.paint['line-color'] = this.townshipLineFilter;
      }
      this.map.setPaintProperty(this.mapvars.layers.township.poly.id, 'fill-color', this.mapvars.layers.township.poly.paint['fill-color']);
      this.map.setPaintProperty(this.mapvars.layers.township.poly.id, 'fill-opacity', this.mapvars.layers.township.poly.paint['fill-opacity']);
      this.map.setPaintProperty(this.mapvars.layers.township.poly.id, 'fill-outline-color', this.mapvars.layers.township.poly.paint['fill-outline-color']);
      this.map.setPaintProperty(this.mapvars.layers.township.border.id, 'line-color', this.mapvars.layers.township.border.paint['line-color']);

      this.appService.sendMessage({
        type: 'town',
        name: state.township_name,
        id: state.township_fips,
      });
    } else {
      if (state.township_fips !== '') {
        this.mapvars.layers.township.poly.paint['fill-color'] = this.townshipFillFilter;
        this.mapvars.layers.township.poly.paint['fill-outline-color'] = this.townshipFillFilter;
        this.mapvars.layers.township.poly.paint['fill-opacity'] = ['case',
          ['boolean', ['feature-state', 'hover'], false], 0.58,
          0.7
        ];
        this.mapvars.layers.township.border.paint['line-color'] = this.townshipLineFilter;
        this.map.setPaintProperty(this.mapvars.layers.township.poly.id, 'fill-color', this.mapvars.layers.township.poly.paint['fill-color']);
        this.map.setPaintProperty(this.mapvars.layers.township.poly.id, 'fill-opacity', this.mapvars.layers.township.poly.paint['fill-opacity']);
        this.map.setPaintProperty(this.mapvars.layers.township.poly.id, 'fill-outline-color', this.mapvars.layers.township.poly.paint['fill-outline-color']);
        this.map.setPaintProperty(this.mapvars.layers.township.border.id, 'line-color', this.mapvars.layers.township.border.paint['line-color']);
      }
    }
    this.map.fitBounds(state.bbox, {padding: 10});
    this.selectedState = state.state_fips;
    this.selectedStateName = state.state_name;
    this.selectedCounty = state.county_fips;
    this.selectedCountyName = state.county_name;
    this.selectedTownship = state.township_fips;
    this.selectedTownshipName = state.township_name;
  }

  deleteMapState() {
    if (this.mapStates.length > 1) {
      this.mapStates.pop();
    }
  }

  back() {
    this.deleteMapState();
    this.updateMapState();
  }
}
