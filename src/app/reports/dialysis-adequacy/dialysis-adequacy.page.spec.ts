import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialysisAdequacyPage } from './dialysis-adequacy.page';

describe('DialysisSummaryPage', () => {
  let component: DialysisAdequacyPage;
  let fixture: ComponentFixture<DialysisAdequacyPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DialysisAdequacyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
