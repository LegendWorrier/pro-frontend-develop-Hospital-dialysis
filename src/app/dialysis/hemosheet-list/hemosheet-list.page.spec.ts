import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, IonNav } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Patient } from 'src/app/patients/patient';
import { HemoDialysisService } from '../hemo-dialysis.service';

import { HemosheetListPage } from './hemosheet-list.page';

describe('HemosheetListPage', () => {
  let component: HemosheetListPage;
  let fixture: ComponentFixture<HemosheetListPage>;

  let hemoSpy, navSpy;

  beforeEach(waitForAsync(() => {
    hemoSpy = jasmine.createSpyObj('HemoDialysisService', ['getHemoSheetList']);
    navSpy = jasmine.createSpyObj('IonNav', ['']);

    // setup mock
    hemoSpy.getHemoSheetList = jasmine.createSpy().and.returnValue(new Observable);

    TestBed.configureTestingModule({
      declarations: [ HemosheetListPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: HemoDialysisService, useValue: hemoSpy },
        { provide: IonNav, useValue: navSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HemosheetListPage);
    component = fixture.componentInstance;
    component.patient = new Patient;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
