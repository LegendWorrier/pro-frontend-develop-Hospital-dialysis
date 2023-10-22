import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressNoteEditPage } from './progress-note-edit.page';

describe('ProgressNoteEditPage', () => {
  let component: ProgressNoteEditPage;
  let fixture: ComponentFixture<ProgressNoteEditPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ProgressNoteEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
