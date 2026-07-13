import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyThankYouComponent } from './survey-thank-you.component';

describe('SurveyThankYouComponent', () => {
  let component: SurveyThankYouComponent;
  let fixture: ComponentFixture<SurveyThankYouComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyThankYouComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurveyThankYouComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
