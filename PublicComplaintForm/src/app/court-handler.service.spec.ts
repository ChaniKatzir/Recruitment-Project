import { TestBed } from '@angular/core/testing';

import { CourtHandlerService } from './court-handler.service';

describe('CourtHandlerService', () => {
  let service: CourtHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourtHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
