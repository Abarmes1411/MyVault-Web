import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserreviewsResumeComponent } from './userreviews-resume.component';

describe('UserreviewsResumeComponent', () => {
  let component: UserreviewsResumeComponent;
  let fixture: ComponentFixture<UserreviewsResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserreviewsResumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserreviewsResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
