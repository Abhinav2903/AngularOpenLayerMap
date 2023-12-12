import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapVisualisationComponent } from './map-visualisation.component';

describe('MapVisualisationComponent', () => {
  let component: MapVisualisationComponent;
  let fixture: ComponentFixture<MapVisualisationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapVisualisationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapVisualisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
