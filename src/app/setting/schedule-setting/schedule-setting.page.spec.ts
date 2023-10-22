import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ScheduleSettingPage } from './schedule-setting.page';

describe('ScheduleSettingPage', () => {
  let component: ScheduleSettingPage;
  let fixture: ComponentFixture<ScheduleSettingPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ScheduleSettingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
