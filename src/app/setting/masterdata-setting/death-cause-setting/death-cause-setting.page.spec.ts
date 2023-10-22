import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';

import { DeathCauseSettingPage } from './death-cause-setting.page';

describe('DeathCauseSettingPage', () => {
  let component: DeathCauseSettingPage;
  let fixture: ComponentFixture<DeathCauseSettingPage>;

  let master: MasterdataService;

  beforeEach(waitForAsync(() => {
    master = jasmine.createSpyObj('master', [ 'getDeathCauseList' ]);
    let nav = jasmine.createSpyObj('NavController', ['']);

    TestBed.configureTestingModule({
      declarations: [ DeathCauseSettingPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: MasterdataService, useValue: master },
        { provide: NavController, useValue: nav }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeathCauseSettingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
