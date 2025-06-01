import { TestBed } from '@angular/core/testing';

import { DetailContentsService } from './detail-contents.service';

describe('DetailContentsService', () => {
  let service: DetailContentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetailContentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
