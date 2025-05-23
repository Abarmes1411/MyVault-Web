import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomlistComponent } from './customlist.component';

describe('CustomlistComponent', () => {
  let component: CustomlistComponent;
  let fixture: ComponentFixture<CustomlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
