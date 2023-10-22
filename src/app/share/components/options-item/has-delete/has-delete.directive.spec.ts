import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, Platform } from '@ionic/angular';
import { OptionListComponent } from '../option-list.component';

import { Entity, HasDeleteDirective } from './has-delete.directive';

class Test implements Entity {
  isActive: boolean;

  name: string;
}

describe('HasDeleteComponent', () => {
  let component: HasDeleteDirective<Test>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HasDeleteDirective ],
      imports: [IonicModule.forRoot()],
      providers: [
        ChangeDetectorRef
      ]
    }).compileComponents();

    let cdr = TestBed.inject(ChangeDetectorRef);
    let optionList = new OptionListComponent<Test>(TestBed.inject(Platform));

    component = new HasDeleteDirective<Test>(optionList, cdr);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
