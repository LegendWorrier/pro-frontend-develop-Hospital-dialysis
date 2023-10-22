import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientHistoryDetailPage } from './patient-history-detail.page';

describe('PatientHistoryDetailPage', () => {
  let component: PatientHistoryDetailPage;
  let fixture: ComponentFixture<PatientHistoryDetailPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PatientHistoryDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
