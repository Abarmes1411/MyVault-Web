import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserlistResumeComponent } from './userlist-resume.component';

describe('UserlistResumeComponent', () => {
  let component: UserlistResumeComponent;
  let fixture: ComponentFixture<UserlistResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserlistResumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserlistResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
