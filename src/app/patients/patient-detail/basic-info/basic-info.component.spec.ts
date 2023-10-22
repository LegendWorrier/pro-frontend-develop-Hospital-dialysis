import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';
import { AppPipeModule } from 'src/app/pipes/app.pipe.module';
import { Patient } from '../../patient';
import { PatientService } from '../../patient.service';

import { BasicInfoComponent } from './basic-info.component';

describe('BasicInfoComponent', () => {
  let component: BasicInfoComponent;
  let fixture: ComponentFixture<BasicInfoComponent>;

  let activatedRouteSpy, navSpy, patientSpy;

  beforeEach(waitForAsync(() => {
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['']);
    navSpy = jasmine.createSpyObj('NavController', ['']);
    patientSpy = jasmine.createSpyObj('PatientService', ['setTmp']);

    //setup mock
    patientSpy.setTmp = jasmine.createSpy();

    TestBed.configureTestingModule({
      declarations: [ BasicInfoComponent ],
      imports: [IonicModule.forRoot(), AppPipeModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: NavController, useValue: navSpy },
        { provide: PatientService, useValue: patientSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BasicInfoComponent);
    component = fixture.componentInstance;
    component.patient = new Patient;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
