import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapVisualisationComponent } from './feature/map-visualisation/map-visualisation.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReverseGeocodeService } from './service/reverse-geocode.service';
@NgModule({
  declarations: [
    AppComponent,
    MapVisualisationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [ReverseGeocodeService,HttpClient],
  bootstrap: [AppComponent]
})
export class AppModule { }
