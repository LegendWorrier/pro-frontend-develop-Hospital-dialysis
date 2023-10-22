import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { Data } from 'src/app/masterdata/data';

import { MasterdataListComponent } from './masterdata-list.component';

describe('MasterdataListComponent', () => {
  let component: MasterdataListComponent;
  let fixture: ComponentFixture<MasterdataListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MasterdataListComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MasterdataListComponent);
    component = fixture.componentInstance;

    component.getData = of([] as Data[]);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
