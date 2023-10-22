import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabExamSettingPage } from './lab-exam-setting.page';

describe('LabExamSettingPage', () => {
  let component: LabExamSettingPage;
  let fixture: ComponentFixture<LabExamSettingPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LabExamSettingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
