import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AvShuntService } from '../../av-shunt.service';
import { EditAvIssuePageModule } from './edit-av-issue.module';

import { EditAvIssuePage } from './edit-av-issue.page';

describe('EditAvIssuePage', () => {
  let component: EditAvIssuePage;
  let fixture: ComponentFixture<EditAvIssuePage>;

  let avshuntSpy;

  beforeEach(waitForAsync(() => {
    avshuntSpy = jasmine.createSpyObj('AvShuntService', ['getAvShuntSiteName', 'getAvShuntList', 'setTmp']);
    let navSpy = jasmine.createSpyObj('NavController', ['UrlSerializer']);

    // setup mock
    avshuntSpy.getAvShuntList = jasmine.createSpy('getAvShuntList').and.returnValue(new Observable);
    avshuntSpy.setTmp = jasmine.createSpy('setTmp');

    TestBed.configureTestingModule({
      declarations: [ EditAvIssuePage ],
      imports: [IonicModule.forRoot(), EditAvIssuePageModule],
      providers: [
        { provide: AvShuntService, useValue: avshuntSpy },
        { provide: NavController, useValue: navSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditAvIssuePage);
    component = fixture.componentInstance;
    component.issue = { patientId: 'test', type: 'avIssue', isActive: true };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
