import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';
import { HttpClient } from '@angular/common/http';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon } from 'ol/style';
import Feature from 'ol/Feature';
import LayerGroup from 'ol/layer/Group';
import { toStringHDMS } from 'ol/coordinate';
import { ReverseGeocodeService } from 'src/app/service/reverse-geocode.service';
import { Observable, catchError, map, of } from 'rxjs';

@Component({
  selector: 'app-map-visualisation',
  templateUrl: './map-visualisation.component.html',
  styleUrls: ['./map-visualisation.component.scss'],
})
export class MapVisualisationComponent implements OnInit {
  @ViewChild('map', { static: true }) mapElement!: ElementRef;
  private map!: Map;
  private popup!: Overlay;
  lat: any;
  lng: any;
  address: any;
  initialcord: any;

  constructor(private reverseGeocodeService: ReverseGeocodeService) {}

  ngOnInit(): void {
    this.initMap();
    this.initPopup();
  }

  private initMap(): void {
    //  this.initialcord = await this.getGeocode('Eifel Str. 20, Bonn, 53119, Germany')
    // this.lat = this.initialcord.lat;
    // this.lng = this.initialcord.lng;
    const osmLayer = new TileLayer({
      source: new OSM(),
    });

    this.map = new Map({
      target: this.mapElement.nativeElement,
      layers: [osmLayer],
      view: new View({
        center: fromLonLat([7.083979689042522, 50.73784467220557]), // Eifel Str. 20, Bonn, 53119, Germany
        zoom: 20,
      }),
    });
    this.addMarker([7.083979689042522, 50.73784467220557]);
  }

  private addMarker(coordinates: number[]): void {
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

  private initPopup(): void {
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
      const coordinate = evt.coordinate;
      console.log('Coordinate', coordinate);
      const hdms = toStringHDMS(toLonLat(coordinate));

      this.getReverseGeocode(coordinate).subscribe(
        (address) => {
          console.log('Address!', address);
          // Display the popup with the retrieved information
          this.popup.setPosition(coordinate);
          document.getElementById('popup-content')!.innerHTML = address;
        },
        (error) => {
          console.error('Error:', error);
        }
      );
    });
  }

  // Add a method to close the popup
  closePopup(): void {
    this.popup.setPosition(undefined);
  }

  private getReverseGeocode(coordinate: number[]): Observable<string> {
    // Replace this with your actual reverse geocoding logic or API call
    return this.reverseGeocodeService.reverseGeocode(coordinate).pipe(
      map((data) => data.results[0].formatted),
      catchError((error) => {
        console.error('Error:', error);
        return of('Error retrieving address'); // Return a default value or handle the error accordingly
      })
    );
  }

  private getGeocode(address: string) {
    // this.reverseGeocodeService.geocode(address).subscribe(
    //   (data)=>{console.log("Data",data.results[0].geometry)})
    return this.reverseGeocodeService.geocode(address).pipe(
      map((data) => data.results[0].geometry),
      catchError((error) => {
        console.error('Error:', error);
        return of('Error retrieving address'); // Return a default value or handle the error accordingly
      })
    );
  }
}
