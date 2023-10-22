import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { RoleDetailPage } from './role-detail.page';

describe('RoleDetailPage', () => {
  let component: RoleDetailPage;
  let fixture: ComponentFixture<RoleDetailPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RoleDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
