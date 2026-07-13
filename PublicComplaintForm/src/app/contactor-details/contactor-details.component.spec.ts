import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactorDetailsComponent } from './contactor-details.component';

describe('ContactorDetailsComponent', () => {
  let component: ContactorDetailsComponent;
  let fixture: ComponentFixture<ContactorDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactorDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactorDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
