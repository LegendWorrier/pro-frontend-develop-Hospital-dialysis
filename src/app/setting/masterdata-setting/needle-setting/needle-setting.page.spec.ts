import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';

import { NeedleSettingPage } from './needle-setting.page';

describe('NeedleSettingPage', () => {
  let component: NeedleSettingPage;
  let fixture: ComponentFixture<NeedleSettingPage>;

  let master: MasterdataService;

  beforeEach(waitForAsync(() => {
    master = jasmine.createSpyObj('master', [ 'getNeedleList' ]);
    let nav = jasmine.createSpyObj('NavController', ['']);

    TestBed.configureTestingModule({
      declarations: [ NeedleSettingPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: MasterdataService, useValue: master },
        { provide: NavController, useValue: nav }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NeedleSettingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
