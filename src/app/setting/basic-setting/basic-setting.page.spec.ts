import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { of } from 'rxjs';
import { ImageAndFileUploadService } from 'src/app/share/service/image-and-file-upload.service';

import { BasicSettingPage } from './basic-setting.page';

describe('BasicSettingPage', () => {
  let component: BasicSettingPage;
  let fixture: ComponentFixture<BasicSettingPage>;

  let imageService, formSpy;

  beforeEach(waitForAsync(() => {
    imageService = jasmine.createSpyObj('imgService', ['']);
    formSpy = jasmine.createSpyObj('FormBuilder', ['']);
    let nav = jasmine.createSpyObj('NavController', ['']);

    // setup mock
    imageService.getImage = jasmine.createSpy().and.returnValue(of(null));

    TestBed.configureTestingModule({
      declarations: [ BasicSettingPage ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule, ReactiveFormsModule ],
      providers: [
        { provide: ImageAndFileUploadService, useValue: imageService },
        { provide: NavController, useValue: nav },
        FormBuilder,
        
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BasicSettingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
