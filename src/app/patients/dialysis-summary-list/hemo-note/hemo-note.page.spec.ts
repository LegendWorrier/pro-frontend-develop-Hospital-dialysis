import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HemoNotePage } from './hemo-note.page';

describe('HemoNotePage', () => {
  let component: HemoNotePage;
  let fixture: ComponentFixture<HemoNotePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(HemoNotePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
