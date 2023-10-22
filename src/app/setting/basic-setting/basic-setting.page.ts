import { ConfigService } from './../../share/service/config.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CameraSource } from '@capacitor/camera';
import { IonContent, Platform } from '@ionic/angular';
import { AppConfig } from 'src/app/app.config';
import { Align, IAppConfig } from 'src/app/IAppConfig';
import { ImageAndFileUploadService } from 'src/app/share/service/image-and-file-upload.service';

@Component({
  selector: 'app-basic-setting',
  templateUrl: './basic-setting.page.html',
  styleUrls: ['./basic-setting.page.scss'],
})
export class BasicSettingPage implements OnInit {

  src: string;
  @ViewChild(IonContent) content: IonContent;

  form: FormGroup<{
    "global:logoAlign": FormControl<Align>;
    centerName: FormControl<string>;
    centerType: FormControl<"hospital" | "hc">;
    secureDomain: FormControl<string>;
    apiServer: FormControl<string>;
    reportService: FormControl<string>;
    decimalPrecision: FormControl<number>;
    his: FormControl<boolean>}>;
  
  uploadData: Blob;

  config: IAppConfig = AppConfig.config;

  error: string;
  showAdvance: boolean;

  get isHospital(): boolean { return this.form.value.centerType === 'hospital'; }
  centerTypes = [
    { name: 'Hospital', value: 'hospital' },
    { name: 'Hemodialysis Center', value: 'hc' }
  ];

  constructor(private img: ImageAndFileUploadService,
              private plt: Platform,
              private formBuilder: FormBuilder,
              private configService: ConfigService)
    {
      this.config.global = this.config.global ?? { logoAlign: 0 };
      this.form = this.formBuilder.group({
        "global:logoAlign": new FormControl<Align>(this.config.global.logoAlign),
        centerName: new FormControl<string | null>(this.config.centerName, Validators.required),
        centerType: new FormControl(this.config.centerType, {nonNullable: true, validators: Validators.required}),
        secureDomain: new FormControl(this.config.secureDomain, {nonNullable: true, validators: Validators.required}),
        apiServer: new FormControl(this.config.apiServer, {nonNullable: true, validators: Validators.required}),
        reportService: new FormControl(this.config.reportService, {nonNullable: true, validators: Validators.required}),
        decimalPrecision: new FormControl(this.config.decimalPrecision, Validators.required),
        his: new FormControl(this.config.enableHIS, Validators.required)
      });
      
    }

  ngOnInit() {
    // load logo from server
    this.loadLogo();
  }

  get width() { return this.plt.width(); }

  loadLogo() {
    this.img.getImageOrFile('logo')
    .subscribe({
      next: (data) => {
        if (data) {
          const url = window.URL.createObjectURL(data);
          this.src = url;
        }
      },
      error: (err) => {
        if (err.status === 404) {
          return;
        }
        throw err;
      }
    });
  }

  async chooseLogo() {
    const image = await this.img.selectPicture(CameraSource.Photos);
    if (!image) {
      return;
    }
    console.log(image);
    this.src = image.path;

    this.uploadData = image.data;
    console.log(this.uploadData);
  }

  async save() {
    const secureDomain = this.form.get('secureDomain').value;
    this.form.get('secureDomain').setValue(secureDomain.replace(/https?\/\//, ''));

    const formData = new FormData();

    for (const name in this.form.value) {
      if (Object.prototype.hasOwnProperty.call(this.form.value, name)) {
        const value = this.form.value[name];
        if (value !== this.config[name]) {
          formData.append(name, value);
        }
      }
    }

    if (this.uploadData) {
      formData.append('logo', this.uploadData, 'logo');
    }

    await this.configService.updateConfig(formData, { onSuccess: () => this.loadLogo() });
  }

}
