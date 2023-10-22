import { Component } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';

import { SegmentTabsComponent } from './segment-tabs.component';

@Component({
  template: `
  <ion-content>
  <app-segment-tabs [tabs]="tabs"></app-segment-tabs>
  </ion-content>
  `
})
class TestComponent {
  tabs = [
    {
      name: 'test',
      display: 'Test',
      icon: 'check'
    }
  ];
}

describe('SegmentTabsComponent', () => {
  let component: SegmentTabsComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SegmentTabsComponent, TestComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    let fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('app-segment-tabs'));
    component = el.componentInstance;

  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
