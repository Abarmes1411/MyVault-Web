import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomlistResumeComponent } from './customlist-resume.component';

describe('CustomlistResumeComponent', () => {
  let component: CustomlistResumeComponent;
  let fixture: ComponentFixture<CustomlistResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomlistResumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomlistResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
