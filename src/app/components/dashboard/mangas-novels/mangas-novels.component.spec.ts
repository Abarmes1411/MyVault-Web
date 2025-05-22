import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MangasNovelsComponent } from './mangas-novels.component';

describe('MangasNovelsComponent', () => {
  let component: MangasNovelsComponent;
  let fixture: ComponentFixture<MangasNovelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MangasNovelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MangasNovelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
