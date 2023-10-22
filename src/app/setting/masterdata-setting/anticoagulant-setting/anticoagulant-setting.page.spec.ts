import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';

import { AnticoagulantSettingPage } from './anticoagulant-setting.page';

describe('AnticoagulantSettingPage', () => {
  let component: AnticoagulantSettingPage;
  let fixture: ComponentFixture<AnticoagulantSettingPage>;

  let master: MasterdataService;

  beforeEach(waitForAsync(() => {
    master = jasmine.createSpyObj('master', [ 'getAnticoagulantList', 'addAnticoagulant' ]);
    let nav = jasmine.createSpyObj('NavController', ['']);

    TestBed.configureTestingModule({
      declarations: [ AnticoagulantSettingPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: MasterdataService, useValue: master },
        { provide: NavController, useValue: nav }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AnticoagulantSettingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
