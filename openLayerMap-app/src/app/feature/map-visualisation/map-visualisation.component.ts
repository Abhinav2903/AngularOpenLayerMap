import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';
import { HttpClient } from '@angular/common/http';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer } from 'ol/layer';
import { TileWMS, Vector as VectorSource } from 'ol/source';
import { Style, Icon, Fill, Stroke } from 'ol/style';
import Feature from 'ol/Feature';
import LayerGroup from 'ol/layer/Group';
import { toStringHDMS } from 'ol/coordinate';
import { ReverseGeocodeService } from 'src/app/service/reverse-geocode.service';
import { Observable, catchError, map, of } from 'rxjs';
import GeoJSON from 'ol/format/GeoJSON';
import { Geometry } from 'ol/geom';
@Component({
  selector: 'app-map-visualisation',
  templateUrl: './map-visualisation.component.html',
  styleUrls: ['./map-visualisation.component.scss'],
})
export class MapVisualisationComponent implements OnInit {
  @ViewChild('map', { static: true }) mapElement!: ElementRef;
  map!: Map;
  popup!: Overlay;
  geoJsonSource!: VectorSource;

  lat: any;
  lng: any;
  address: any;
  initialcord: any;
  vectorLayer!: VectorLayer<VectorSource<Feature<Geometry>>>;
  wmsLayerVisible: boolean = false;
  wmsLayerGroup!: LayerGroup;

  initialCoordinate: any; // Eifel Str. 20, Bonn, 53119, Germany
  initialView: any;
  showError: boolean = false;
  errorMessage: string='An error occured';

  constructor(private reverseGeocodeService: ReverseGeocodeService) {}

  ngOnInit(): void {
    this.initMap();
  }

  initMap(): void {
    const osmLayer = new TileLayer({
      source: new OSM(),
    });

    this.geoJsonSource = new VectorSource({
      format: new GeoJSON(),
    });

    const geoJsonLayer = new VectorLayer({
      source: this.geoJsonSource,
      style: this.createStyleFunction(),
    });

    // / Store a reference to the VectorLayer
    this.vectorLayer = new VectorLayer({
      source: this.geoJsonSource,
      style: this.createStyleFunction(),
    });

    // Create a layer group for the WMS layer
    this.wmsLayerGroup = new LayerGroup({
      layers: [
        new TileLayer({
          visible: this.wmsLayerVisible,
          source: new TileWMS({
            url: 'https://sedac.ciesin.columbia.edu/geoserver/wms',
            params: {
              LAYERS:
                'epi:epi-environmental-performance-index-2020_eco-agriculture',
              TILED: true,
            },
            serverType: 'geoserver',
            transition: 0,
          }),
        }),
      ],
    });
    this.getGeocode(
      'ForestFinest Consulting GmbH, Eifelstraße 20, 53119 Bonn, Germany'
    ).subscribe((data) => {
      console.log('Geocoded Data', data);
      this.initialCoordinate = [data.lng, data.lat];
      this.initialView = {
        center: fromLonLat(this.initialCoordinate),
        zoom: 20,
        projection: 'EPSG:3857',
        // Add any other initial view parameters as needed
      };
      this.map = new Map({
        target: this.mapElement.nativeElement,
        layers: [osmLayer, geoJsonLayer, this.vectorLayer, this.wmsLayerGroup],
        view: new View({
          center: fromLonLat(this.initialCoordinate),
          zoom: this.initialView.zoom,
          projection: this.initialView.projection,
        }),
      });
      this.addMarker(this.initialCoordinate);
      this.initPopup();
    });
  }

  addMarker(coordinates: number[]): void {
    const markerImageSrc = 'assets/marker.png';
    const marker = new Feature({
      geometry: new Point(fromLonLat(coordinates)),
    });

    marker.setStyle(
      new Style({
        image: new Icon({
          anchor: [0.5, 0.5],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          src: markerImageSrc,
          scale: 0.05,
        }),
      })
    );

    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [marker],
      }),
    });

    console.log(this.map.getAllLayers());
    this.map.addLayer(vectorLayer);
    console.log(this.map.getAllLayers());
  }

  initPopup(): void {
    this.popup = new Overlay({
      element: document.getElementById('popup') as HTMLElement,
      autoPan: true,
    });

    this.popup.setPositioning('center-center'); // Set positioning to center-center

    this.map.addOverlay(this.popup);

    // Handle close button click
    document.getElementById('popup-closer')?.addEventListener('click', () => {
      this.popup.setPosition(undefined);
    });
  }

  handleMapClick(event: any): void {
    this.map.on('singleclick', (evt) => {
      console.log('Coordinate', evt.coordinate);
      this.getReverseGeocode(evt.coordinate).subscribe(
        (address) => {
          console.log('Address!', address);
          // Display the popup with the retrieved information
          this.popup.setPosition(evt.coordinate);
          document.getElementById('popup-content')!.innerHTML = address;
        },
        (error) => {
          console.error('Reverse Geocode Error:', error);

          // displaying an error message in the popup
          this.popup.setPosition(evt.coordinate);
          document.getElementById('popup-content')!.innerHTML =
            'Error retrieving address';
        }
      );

      document.addEventListener('click', (event) => {
        const mapElement = this.map.getTargetElement();
        if (
          event.target !== mapElement &&
          !mapElement.contains(event.target as Node)
        ) {
          this.popup.setPosition(undefined);
        }
      });
    });
  }

  // Add a method to close the popup
  closePopup(): void {
    this.popup.setPosition(undefined);
  }

  getReverseGeocode(coordinate: number[]): Observable<string> {
    // Replace this with your actual reverse geocoding logic or API call
    return this.reverseGeocodeService.reverseGeocode(coordinate).pipe(
      map((data) => data.results[0].formatted),
      catchError((error) => {
        console.error('Error:', error);
        return of('Error retrieving address'); // Return a default value or handle the error
      })
    );
  }

  createStyleFunction(): Style {
    return new Style({
      fill: new Fill({
        color: 'rgba(255, 0, 0, 0.2)',
      }),
      stroke: new Stroke({
        color: 'rgba(255, 0, 0, 0.8)',
        width: 2,
      }),
    });
  }

  loadGeoJsonData(data: any): void {
    try {
      console.log('Received GeoJSON data:', data);

      // Create a GeoJSON format object
      const geoJsonFormat = new GeoJSON();

      // Specify the projection of your GeoJSON data (if it's different from EPSG:4326)
      const options = { featureProjection: 'EPSG:3857' };

      // Read features from GeoJSON data with the specified options
      const features = geoJsonFormat.readFeatures(
        data,
        options
      ) as Feature<Geometry>[];

      console.log('Parsed GeoJSON features:', features);

      // Clear existing features and add the new features
      this.geoJsonSource.clear();
      this.geoJsonSource.addFeatures(features);

      // Zoom to the extent of the features
      this.map.getView().fit(this.geoJsonSource.getExtent(), {
        padding: [10, 10, 10, 10],
        maxZoom: 15,
      });

      this.vectorLayer.changed(); // Trigger a layer update
    } catch (error) {
      console.error('Error loading GeoJSON data:', error);
      
      // Update the UI or show a notification with the error message
      // For example, you can set a variable to display an error message in the template
      this.showError = true;
      this.errorMessage = 'Error loading GeoJSON data. Please try again.';
    }
  }

  onFileInputChange(event: any): void {
    this.showError = false;
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const geoJsonData = JSON.parse(e.target.result);
          this.loadGeoJsonData(geoJsonData);
        } catch (error) {
          console.error('Error parsing GeoJSON file:', error);
        }
      };
      reader.readAsText(file);
    }
  }

  // Function to toggle the visibility of the WMS layer
  toggleWMSLayer(): void {
    this.wmsLayerVisible = !this.wmsLayerVisible;
    this.wmsLayerGroup.getLayers().forEach((layer) => {
      if (layer instanceof TileLayer) {
        layer.setVisible(this.wmsLayerVisible);
      }
    });
    this.zoomOutWmsLayer(this.wmsLayerVisible);
  }

  zoomOutWmsLayer(wmsLayerVisible: boolean): void {
    // Get the view of the map
    const view = this.map.getView();

    // If the WMS layer is now visible, zoom out the map
    if (wmsLayerVisible) {
      const minZoom = view.getMinZoom();
      view.animate({
        zoom: minZoom,
      });
    } else {
      view.animate({
        center: this.initialView.center,
        zoom: this.initialView.zoom,
      });
    }
  }

  // function to get geocode from the location used for initial location
  getGeocode(address: string) {
    return this.reverseGeocodeService.geocode(address).pipe(
      map((data) => data.results[0].geometry),
      catchError((error) => {
        console.error('Error:', error);
        return of('Error retrieving address'); // Return a default value or handle the error
      })
    );
  }
}
