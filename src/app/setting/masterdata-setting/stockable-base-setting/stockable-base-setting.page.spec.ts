import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';

import { MedicineSettingPage } from './medicine-setting.page';

describe('MedicineSettingPage', () => {
  let component: MedicineSettingPage;
  let fixture: ComponentFixture<MedicineSettingPage>;

  let master: MasterdataService;

  beforeEach(waitForAsync(() => {
    master = jasmine.createSpyObj('master', [ 'getMedicineList' ]);
    let nav = jasmine.createSpyObj('NavController', ['']);

    TestBed.configureTestingModule({
      declarations: [ MedicineSettingPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: MasterdataService, useValue: master },
        { provide: NavController, useValue: nav }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MedicineSettingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
