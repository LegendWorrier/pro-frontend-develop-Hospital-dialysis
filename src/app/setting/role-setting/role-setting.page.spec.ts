import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { RoleSettingPage } from './role-setting.page';

describe('RoleSettingPage', () => {
  let component: RoleSettingPage;
  let fixture: ComponentFixture<RoleSettingPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RoleSettingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
