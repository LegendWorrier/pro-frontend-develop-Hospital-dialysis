import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { DialysisPrescription } from '../../dialysis-prescription';

import { DialysisPrescriptionViewComponent } from './dialysis-prescription-view.component';

describe('DialysisPrescriptionViewComponent', () => {
  let component: DialysisPrescriptionViewComponent;
  let fixture: ComponentFixture<DialysisPrescriptionViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DialysisPrescriptionViewComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DialysisPrescriptionViewComponent);
    component = fixture.componentInstance;
    component.prescription = new DialysisPrescription;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
