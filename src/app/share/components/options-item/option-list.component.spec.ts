import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { OptionListComponent } from './option-list.component';

class Test {
  name: string;

  constructor() {
    
  }
}

describe('OptionListComponent', () => {
  let component: OptionListComponent<Test>;
  let fixture: ComponentFixture<OptionListComponent<Test>>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OptionListComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent<OptionListComponent<Test>>(OptionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
