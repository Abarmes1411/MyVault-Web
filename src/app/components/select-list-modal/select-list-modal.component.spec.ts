import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectListModalComponent } from './select-list-modal.component';

describe('SelectListModalComponent', () => {
  let component: SelectListModalComponent;
  let fixture: ComponentFixture<SelectListModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectListModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectListModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
