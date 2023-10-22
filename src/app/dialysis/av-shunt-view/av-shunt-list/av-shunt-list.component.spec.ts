import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { AvShuntService } from '../../av-shunt.service';

import { AvShuntListComponent } from './av-shunt-list.component';

describe('AvShuntListComponent', () => {
  let component: AvShuntListComponent;
  let fixture: ComponentFixture<AvShuntListComponent>;

  let avshuntSpy;

  beforeEach(waitForAsync(() => {
    avshuntSpy = jasmine.createSpyObj('AvShuntService', ['getAvShuntSiteName']);

    TestBed.configureTestingModule({
      declarations: [ AvShuntListComponent ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AvShuntService, useValue: avshuntSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AvShuntListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
