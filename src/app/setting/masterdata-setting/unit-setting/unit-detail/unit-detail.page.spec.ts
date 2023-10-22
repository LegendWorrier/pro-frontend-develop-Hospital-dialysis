import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnitDetailPage } from './unit-detail.page';

describe('UnitDetailPage', () => {
  let component: UnitDetailPage;
  let fixture: ComponentFixture<UnitDetailPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(UnitDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
