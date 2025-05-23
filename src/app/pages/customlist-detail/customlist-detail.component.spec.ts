import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomlistDetailComponent } from './customlist-detail.component';

describe('CustomlistDetailComponent', () => {
  let component: CustomlistDetailComponent;
  let fixture: ComponentFixture<CustomlistDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomlistDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomlistDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
