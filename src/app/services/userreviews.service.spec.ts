import { TestBed } from '@angular/core/testing';

import { UserreviewsService } from './userreviews.service';

describe('UserreviewsService', () => {
  let service: UserreviewsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserreviewsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
