import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { AvShuntService } from '../../av-shunt.service';
import { EditAvShuntPageModule } from './edit-av-shunt.module';

import { EditAvShuntPage } from './edit-av-shunt.page';

describe('EditAvShuntPage', () => {
  let component: EditAvShuntPage;
  let fixture: ComponentFixture<EditAvShuntPage>;

  let avshuntSpy;

  beforeEach(waitForAsync(() => {
    avshuntSpy = jasmine.createSpyObj('AvShuntService', ['getAvShuntSiteName']);
    let navSpy = jasmine.createSpyObj('NavController', ['UrlSerializer']);

    TestBed.configureTestingModule({
      declarations: [ EditAvShuntPage ],
      imports: [IonicModule.forRoot(), EditAvShuntPageModule],
      providers: [
        { provide: AvShuntService, useValue: avshuntSpy },
        { provide: NavController, useValue: navSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditAvShuntPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
