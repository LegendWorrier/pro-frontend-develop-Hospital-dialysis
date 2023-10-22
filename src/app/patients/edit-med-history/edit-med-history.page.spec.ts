import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditMedHistoryPage } from './edit-med-history.page';

describe('EditMedHistoryPage', () => {
  let component: EditMedHistoryPage;
  let fixture: ComponentFixture<EditMedHistoryPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EditMedHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
