import { TestBed } from '@angular/core/testing';

import { CustomlistsService } from './customlists.service';

describe('CustomlistsService', () => {
  let service: CustomlistsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomlistsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
