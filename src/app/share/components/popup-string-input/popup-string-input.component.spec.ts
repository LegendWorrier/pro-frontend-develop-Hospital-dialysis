import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupStringInputComponent } from './popup-string-input.component';

describe('PopupStringInputComponent', () => {
  let component: PopupStringInputComponent;
  let fixture: ComponentFixture<PopupStringInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupStringInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupStringInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
