import { TestBed } from '@angular/core/testing';

import { LoaderDataService } from './loader-data.service';

describe('LoaderDataService', () => {
  let service: LoaderDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoaderDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
