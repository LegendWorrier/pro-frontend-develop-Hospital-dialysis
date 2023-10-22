import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MedicinePrescriptionListPage } from './medicine-prescription-list.page';

describe('MedicinePrescriptionListPage', () => {
  let component: MedicinePrescriptionListPage;
  let fixture: ComponentFixture<MedicinePrescriptionListPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MedicinePrescriptionListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MedicinePrescriptionListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
