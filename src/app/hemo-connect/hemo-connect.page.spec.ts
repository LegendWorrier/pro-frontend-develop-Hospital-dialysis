import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HemoConnectPage } from './hemo-connect.page';

describe('HemoConnectPage', () => {
  let component: HemoConnectPage;
  let fixture: ComponentFixture<HemoConnectPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(HemoConnectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
