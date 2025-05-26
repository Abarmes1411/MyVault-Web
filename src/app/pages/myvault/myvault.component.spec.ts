import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyvaultComponent } from './myvault.component';

describe('MyvaultComponent', () => {
  let component: MyvaultComponent;
  let fixture: ComponentFixture<MyvaultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyvaultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyvaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
