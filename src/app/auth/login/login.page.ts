import { ScreenOrientation } from '@capacitor/screen-orientation';
import { SMART_LOGIN_PREFIX } from './../smart-login.service';
import { presentToast, isDesktopOrLaptop, ToastType, handleHttpError } from 'src/app/utils';
import { SwUpdate } from '@angular/service-worker';
import { A2hsService } from './../../share/service/a2hs.service';
import { AfterViewInit, Component, ViewChild, OnInit, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonModal, LoadingController, NavController, Platform } from '@ionic/angular';
import { finalize, first } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { Login } from '../login';
import { ModalService } from 'src/app/share/service/modal.service';
import { AppSettingPage } from 'src/app/setting/app-setting/app-setting.page';
import { AppConfig } from 'src/app/app.config';
import { environment } from 'src/environments/environment';
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode"
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Html5QrcodeResult } from 'html5-qrcode/esm/core';
import { ImageAndFileUploadService } from 'src/app/share/service/image-and-file-upload.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, AfterViewInit {
  isMobileApp: boolean;
  isIOS: boolean;
  get showInstall(): boolean { return this.pwaSupported && this.a2hs.checkShowInstall() && !this.a2hs.checkStandalone(); }
  get showForceInstalled(): boolean { return !this.a2hs.isInstalled && this.a2hs.isInstalledHint; }

  hospitalName: string;
  isCenter: boolean;
  errorTxt: string;
  private loggingIn: boolean;
  private pwaSupported: boolean;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(IonModal) readerModal: IonModal;

  constructor(private authService: AuthService,
              private navCtl: NavController,
              private file: ImageAndFileUploadService,
              private loadingCtrl: LoadingController,
              private a2hs: A2hsService,
              private sw: SwUpdate,
              private injector: Injector,
              private modal: ModalService,
              private plt: Platform) {
      this.isMobileApp = plt.is('capacitor');
      this.isIOS = plt.is('ios');
  }

  ngOnInit(): void {
    this.pwaSupported = this.sw.isEnabled || !environment.production;
  }

  ngAfterViewInit(): void {
    ScreenOrientation.addListener('screenOrientationChange', () => {
      this.setOrientation();
    });
    this.setOrientation();
    AppConfig.configWatch.subscribe(config => {
      this.hospitalName = config?.centerName;
      this.isCenter = config?.centerType === 'hc';
    });

    this.readerModal.ionModalWillDismiss.subscribe(() => {
      this.cancelScan();
    });
  }

  async setOrientation() {
    const ori = await ScreenOrientation.orientation();
    const isLandscape = ori.type === 'landscape-primary' || ori.type === 'landscape-secondary';
    if (!isLandscape) {
      this.content.scrollY = false;
    }
    else {
      this.content.scrollY = true;
    }
  }

  async login(form: { value: Login; }){
    if (this.loggingIn) {
      return;
    }
    if (!AppConfig.isInit) {
      this.errorTxt = 'The server url is not yet config.';
      return;
    }
    const loading = await this.loadingCtrl.create({
      message: 'Loggin In...',
      backdropDismiss: false,
      showBackdrop: true,
      keyboardClose: false
    });
    loading.present();
    this.loggingIn = true;
    this.authService.login(form.value)
      .pipe(finalize(() => {
        this.loggingIn = false;
        loading.dismiss();
      }))
      .subscribe( {
        next: () => {
          console.log('finish login');
          // loading.dismiss();
          this.errorTxt = null;
          if (!this.navCtl.navigateForward(['/home'])) {
            window.location.reload();
          }
        },
        error: (err) => {
          console.log(err);
          // this.loggingIn = false;
          this.errorTxt = handleHttpError(err, this.content);
        }
      });
  }

  openAppSetting() {
    this.modal.openModal(AppSettingPage, {});
  }

  install() {
    this.a2hs.addToHomeScreen();
  }

  setInstalled() {
    this.a2hs.setInstalled(true);
  }

  // ========================== Smart Login =================================

  html5QrCode: Html5Qrcode;
  smartLogin() {
    let qrboxFunction = (viewfinderWidth, viewfinderHeight) => {
      let minEdgePercentage = 0.7; // 70%
      let minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
      let qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
      return {
          width: qrboxSize,
          height: qrboxSize
      };
    }

    // this.readerModal.present();
    // this.readerModal.ionModalDidPresent.pipe(first()).subscribe((e) => {
    //   console.log(e);
    //   const modal = e.target as HTMLElement;
    //   const container = modal.querySelector('#reader-container');
    //   const targetH = container.clientHeight;
    //   const screenRatio = window.innerWidth / window.innerHeight;
    //   console.log('ratio', screenRatio);
    //   const targetW = targetH * screenRatio;
    //   console.log('target width:', targetW);
    //   modal.querySelector('#reader').setAttribute('width', `${targetW}px`);
    // });
    // return;
    
    // Desktop
    if (isDesktopOrLaptop(this.plt)) {
      Html5Qrcode.getCameras().then(devices => {
        console.log(devices);
        if (devices && devices.length) {
          var cameraId = devices[0].id;
          
          this.readerModal.present();
          this.readerModal.ionModalDidPresent.pipe(first()).subscribe((e) => {
            const aspect = this.calculateReaderSize(e);

            setTimeout(() => {
              this.html5QrCode = new Html5Qrcode("reader");
              this.html5QrCode.start(
                cameraId, 
                { fps: 10, qrbox: qrboxFunction, aspectRatio: aspect },
                (decoded) => this.onScanSuccess(decoded),
                (err) => console.log(err)
              )
              .catch((err) => {
                // Start failed, handle it.
                presentToast(this.injector, { message: 'Couldn\'t start scanning.', native: true, type: ToastType.alert});
                console.log(err);
              });
            });
          });
        }
        else {
          presentToast(this.injector, {
            header: 'Error',
            message: 'Couldn\'t get the camera device(s).',
            type: ToastType.alert
          });
        }
      }).catch(err => {
        console.log(err);
        this.scanLocalFile();
      });
    }
    else {
      // Mobile or tablet
      this.readerModal.present();
      this.readerModal.ionModalDidPresent.pipe(first()).subscribe((e) => {
        const aspect = this.calculateReaderSize(e);
        setTimeout(() => {
          this.html5QrCode = new Html5Qrcode("reader");
          this.html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: qrboxFunction, aspectRatio: aspect }, (decoded) => this.onScanSuccess(decoded), (err) => console.log(err))
          .catch((err) => {
            // Start failed, handle it.
            presentToast(this.injector, { message: 'Couldn\'t start scanning.', native: true, type: ToastType.alert});
            console.log(err);
            this.scanLocalFile();
          });
        });
      });
    }
  }

  private calculateReaderSize(e) {
    const modal = e.target as HTMLElement;
    const container = modal.querySelector('#reader-container');
    const containerSize = container.getBoundingClientRect();
    console.log('containerSize', containerSize);
    const targetH = containerSize.height;
    const screenRatio = window.screen.availWidth/window.screen.availHeight;
    const containerRatio = containerSize.height/containerSize.width;
    const isLandscape = this.plt.isLandscape();
    const targetRatio = isLandscape ? screenRatio : (containerSize.height/containerSize.width);
    console.log('screen ratio', screenRatio);
    console.log('container ratio', containerRatio);
    const targetW = isLandscape ? (targetH * targetRatio) : (containerSize.width);
    console.log('target width:', targetW);
    const reader = modal.querySelector('#reader-wrapper');
    reader.setAttribute("style", `width:${targetW}px`);
    return targetRatio;
  }

  async scanLocalFile() {
    const data = await Camera.getPhoto({ allowEditing: false, resultType: CameraResultType.Uri })
    .catch(() => {});

    if (!data) return;

    const blob = await fetch(data.webPath).then(r => r.blob());
    const file = new File([ blob ], 'code');
    this.html5QrCode = new Html5Qrcode('reader');
    this.html5QrCode.scanFile(file, false)
    .then((decoded) => this.onScanSuccess(decoded))
    .catch((errorMessage) => {
      console.log('error', errorMessage);
      presentToast(this.injector, {
        header: 'Invalid data',
        message: 'Coudn\'t read the data.',
        type: ToastType.alert
      });
    });
  }

  cancelScan() {
    if (this.html5QrCode) {
      if (this.html5QrCode.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
        this.html5QrCode.stop();
      }
      this.html5QrCode.clear();
    }
    
  }

  async uploadQR() {
    const file = await this.file.browseLocalFile('image/*');
    if (this.html5QrCode.isScanning) {
      this.html5QrCode.stop();
    }
    
    this.readerModal.dismiss();
    
    this.html5QrCode.scanFile(file, false)
    .then((decoded) => this.onScanSuccess(decoded))
    .catch((errorMessage) => {
      console.log('error', errorMessage);
      presentToast(this.injector, {
        header: 'Invalid data',
        message: 'Coudn\'t read the data.',
        type: ToastType.alert
      });
    });
  }

  onScanSuccess(decodedText: string, decodedResult?: Html5QrcodeResult) {
    // do something when code is read
    console.log('read', decodedText);
    this.readerModal.dismiss();
    const token = this.validateAndExtractToken(decodedText);
    if (!token) {
      presentToast(this.injector, {
        header: 'Invalid data',
        message: 'The QR Code is invalid.',
        type: ToastType.alert
      });
      return;
    }
    this.loginWithToken(token);
  }
  
  private validateAndExtractToken(qrdata: string): string {
    if (qrdata.startsWith(SMART_LOGIN_PREFIX)) {
      return qrdata.replace(`${SMART_LOGIN_PREFIX}:`, '');
    }

    return null;
  }

  private async loginWithToken(token: string) {
    this.loggingIn = true;
    const loading = await this.loadingCtrl.create({
      message: 'Loggin In...',
      backdropDismiss: false,
      showBackdrop: true,
      keyboardClose: false
    });
    loading.present();

    this.authService.loginWithToken(token)
      .pipe(finalize(() => {
        this.loggingIn = false;
        loading.dismiss();
      }))
      .subscribe({
        next: () => {
          console.log('finish login');
          this.errorTxt = null;
          this.navCtl.navigateForward(['/home']);
        },
        error: (err) => {
          console.log(err);
          if (err.status === 400 || err.status === 404) {
            this.errorTxt = err.error;
          }
          else {
            throw err;
          }
        }
      });
  }

}


