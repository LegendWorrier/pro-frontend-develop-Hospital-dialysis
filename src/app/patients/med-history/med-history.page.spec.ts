import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedHistoryPage } from './med-history.page';

describe('MedHistoryPage', () => {
  let component: MedHistoryPage;
  let fixture: ComponentFixture<MedHistoryPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MedHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
