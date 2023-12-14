import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';
import { MapVisualisationComponent } from './map-visualisation.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Overlay } from 'ol';
import { Point } from 'ol/geom';
import { of } from 'rxjs';

describe('MapVisualisationComponent', () => {
  let component: MapVisualisationComponent;
  let fixture: ComponentFixture<MapVisualisationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapVisualisationComponent],
      imports: [HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MapVisualisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the map with default configuration', async () => {
    // Spy on getGeocode method to return a mock value
    spyOn(component, 'getGeocode').and.returnValue(of({ lat: 0, lng: 0 }));

    // Spy on initMap method to check if it's called
    spyOn(component, 'initMap').and.callThrough();

    await component.ngOnInit();

    expect(component.map).toBeDefined();
  });

  it('should display a popup when a user clicks on the map', async () => {
    // Spy on getGeocode method to return a mock value
    spyOn(component, 'getGeocode').and.returnValue(of({ lat: 0, lng: 0 }));
  
    // Spy on initMap method to check if it's called
    spyOn(component, 'initMap').and.callThrough();
  
    component.ngOnInit();
  
    // Wait for the asynchronous operations to complete
    await fixture.whenStable();
  
    const coordinate = [0, 0];
  
    // Simulate a map click event
    component.handleMapClick({ coordinate });

    await fixture.whenStable();
  
    // Get the popup element
    const popupElement = document.getElementById('popup') as HTMLElement;
  
    // Expect that the popup element's display property is not 'none'
    expect(window.getComputedStyle(popupElement).display).not.toBe('none');
  });
  
});
