import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TelerikReportingModule } from '@progress/telerik-angular-report-viewer';
import { of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ReportsPageModule } from './reports.module';

import { ReportsPage } from './reports.page';

describe('ReportsPage', () => {
  let component: ReportsPage;
  let fixture: ComponentFixture<ReportsPage>;

  let routeSpy, authSpy;

  beforeEach(waitForAsync(() => {
    routeSpy = jasmine.createSpyObj('ActivatedRoute', ['data']);
    authSpy = jasmine.createSpyObj('AuthService', ['tokenUpdate']);

    //setup mock
    routeSpy.data = of(null);
    authSpy.tokenUpdate.subscribe = jasmine.createSpy(); // = of('test');

    TestBed.configureTestingModule({
      declarations: [ ReportsPage ],
      imports: [IonicModule.forRoot(), TelerikReportingModule],
      providers: [
        { provide: ActivatedRoute, useValue: routeSpy },
        { provide: AuthService, useValue: authSpy },
      ]
    }).compileComponents();


    fixture = TestBed.createComponent(ReportsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
