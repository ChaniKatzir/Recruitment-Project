import { TestBed } from '@angular/core/testing';

import { BreadcrumbsManagerService } from './breadcrumbs-manager.service';

describe('BreadcrumbsManagerService', () => {
  let service: BreadcrumbsManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BreadcrumbsManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
