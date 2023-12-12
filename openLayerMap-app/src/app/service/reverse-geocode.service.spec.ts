import { TestBed } from '@angular/core/testing';

import { ReverseGeocodeService } from './reverse-geocode.service';

describe('ReverseGeocodeService', () => {
  let service: ReverseGeocodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReverseGeocodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
