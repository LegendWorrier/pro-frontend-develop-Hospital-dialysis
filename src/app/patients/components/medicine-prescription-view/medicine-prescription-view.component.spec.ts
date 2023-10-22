import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MedicinePrescriptionViewComponent } from './medicine-prescription-view.component';

describe('MedicinePrescriptionViewComponent', () => {
  let component: MedicinePrescriptionViewComponent;
  let fixture: ComponentFixture<MedicinePrescriptionViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MedicinePrescriptionViewComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MedicinePrescriptionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
