import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserreviewsDetailcontentResumeComponent } from './userreviews-detailcontent-resume.component';

describe('UserreviewsDetailcontentResumeComponent', () => {
  let component: UserreviewsDetailcontentResumeComponent;
  let fixture: ComponentFixture<UserreviewsDetailcontentResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserreviewsDetailcontentResumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserreviewsDetailcontentResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
