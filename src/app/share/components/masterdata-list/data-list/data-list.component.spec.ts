import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';

import { DataListComponent } from './data-list.component';

describe('DataListComponent', () => {
  let component: DataListComponent<any>;
  let fixture: ComponentFixture<DataListComponent<any>>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DataListComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DataListComponent);
    component = fixture.componentInstance;

    component.getData = of( [] as any[]);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
