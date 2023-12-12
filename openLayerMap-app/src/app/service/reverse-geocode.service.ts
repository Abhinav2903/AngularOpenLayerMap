import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment';
import * as olProj from 'ol/proj';

@Injectable({
  providedIn: 'root'
})
export class ReverseGeocodeService {
  private readonly openCageApiKey = environment.openCageApiKey;
   // Replace with your OpenCage API key
  
  constructor(private http: HttpClient) { }

  reverseGeocode(coordinate: number[]): Observable<any> {
    // console.log("Cage API key",this.openCageApiKey)
    const [lon, lat] = olProj.toLonLat(coordinate); // Convert the coordinates to lon/lat
    console.log("Coordinate (lon, lat):", [lon, lat]);
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${this.openCageApiKey}`;
    return this.http.get(url);
  }

  geocode(address: string): Observable<any> {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${this.openCageApiKey}`;
    return this.http.get(url);
  }
}
