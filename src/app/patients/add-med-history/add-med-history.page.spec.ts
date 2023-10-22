import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddMedHistoryPage } from './add-med-history.page';

describe('AddMedHistoryPage', () => {
  let component: AddMedHistoryPage;
  let fixture: ComponentFixture<AddMedHistoryPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddMedHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
