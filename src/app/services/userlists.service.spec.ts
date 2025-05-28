import { TestBed } from '@angular/core/testing';

import { UserlistsService } from './userlists.service';

describe('UserlistsService', () => {
  let service: UserlistsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserlistsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
