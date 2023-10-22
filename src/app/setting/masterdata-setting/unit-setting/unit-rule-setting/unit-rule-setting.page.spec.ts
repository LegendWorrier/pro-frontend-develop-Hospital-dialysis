import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnitRuleSettingPage } from './unit-rule-setting.page';

describe('UnitExtraSettingPage', () => {
  let component: UnitRuleSettingPage;
  let fixture: ComponentFixture<UnitRuleSettingPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(UnitRuleSettingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
