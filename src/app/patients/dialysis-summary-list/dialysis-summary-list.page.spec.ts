import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialysisSummaryListPage } from './dialysis-summary-list.page';

describe('DialysisSummaryListPage', () => {
  let component: DialysisSummaryListPage;
  let fixture: ComponentFixture<DialysisSummaryListPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DialysisSummaryListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
