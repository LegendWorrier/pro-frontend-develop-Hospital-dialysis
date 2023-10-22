import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserPermissionPage } from './user-permission.page';

describe('UserPermissionPage', () => {
  let component: UserPermissionPage;
  let fixture: ComponentFixture<UserPermissionPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(UserPermissionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
