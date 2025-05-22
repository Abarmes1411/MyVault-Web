import { TestBed } from '@angular/core/testing';

import { MangasNovelsService } from './mangas-novels.service';

describe('MangasNovelsService', () => {
  let service: MangasNovelsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MangasNovelsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
