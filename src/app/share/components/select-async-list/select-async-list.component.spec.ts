import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelectAsyncListComponent } from './select-async-list.component';

class Test {
  name: string;

  constructor() {
    
  }
}

describe('SelectAsyncListComponent', () => {
  let component: SelectAsyncListComponent<Test>;
  let fixture: ComponentFixture<SelectAsyncListComponent<Test>>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectAsyncListComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent<SelectAsyncListComponent<Test>>(SelectAsyncListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
