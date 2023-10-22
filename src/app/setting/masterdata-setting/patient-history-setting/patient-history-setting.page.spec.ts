import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientHistorySettingPage } from './patient-history-setting.page';

describe('PatientHistorySettingPage', () => {
  let component: PatientHistorySettingPage;
  let fixture: ComponentFixture<PatientHistorySettingPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PatientHistorySettingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
