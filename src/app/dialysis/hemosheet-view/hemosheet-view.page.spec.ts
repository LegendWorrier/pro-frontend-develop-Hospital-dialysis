import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, IonNav, NavController } from '@ionic/angular';

import { HemosheetViewPage } from './hemosheet-view.page';

describe('HemosheetViewPage', () => {
  let component: HemosheetViewPage;
  let fixture: ComponentFixture<HemosheetViewPage>;

  let navSpy;

  beforeEach(waitForAsync(() => {
    navSpy = jasmine.createSpyObj('IonNav', ['']);
    let navCtl = jasmine.createSpyObj('NavController', ['']);

    TestBed.configureTestingModule({
      declarations: [ HemosheetViewPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: IonNav, useValue: navSpy },
        { provide: NavController, useValue: navCtl },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HemosheetViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
