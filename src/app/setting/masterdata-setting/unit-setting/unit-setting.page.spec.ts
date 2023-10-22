import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';

import { UnitSettingPage } from './unit-setting.page';

describe('UnitSettingPage', () => {
  let component: UnitSettingPage;
  let fixture: ComponentFixture<UnitSettingPage>;

  let master: MasterdataService;

  beforeEach(waitForAsync(() => {
    master = jasmine.createSpyObj('master', [ 'getUnitList' ]);
    let nav = jasmine.createSpyObj('NavController', ['']);

    TestBed.configureTestingModule({
      declarations: [ UnitSettingPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: MasterdataService, useValue: master },
        { provide: NavController, useValue: nav }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitSettingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
