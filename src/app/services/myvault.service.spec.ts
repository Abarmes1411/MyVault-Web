import { TestBed } from '@angular/core/testing';

import { MyvaultService } from './myvault.service';

describe('MyvaultService', () => {
  let service: MyvaultService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyvaultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
