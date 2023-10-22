import { finalize } from 'rxjs/operators';
import { PopupStringInputComponent } from './../share/components/popup-string-input/popup-string-input.component';
import { Platform, PopoverController, LoadingController, ModalController } from '@ionic/angular';
import { GetDataUrlFromCall, addOrEdit, deepCopy, handleHttpError, presentToast } from 'src/app/utils';
import { UserService } from './../auth/user.service';
import { AuthService } from './../auth/auth.service';
import { User } from './../auth/user';
import { Component, OnInit, Injector, ViewChild, ElementRef } from '@angular/core';
import { ImageAndFileUploadService } from '../share/service/image-and-file-upload.service';
import { CameraSource } from '@capacitor/camera';
import { SmartLoginService, SMART_LOGIN_PREFIX } from '../auth/smart-login.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SignaturePadComponent } from '../share/components/signature-pad/signature-pad.component';
import { ErrorCorrectLevel, QR8BitByte, QRCode } from 'qrcode-generator-ts';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user: User;

  editPassword: boolean;
  oldPassword: string;
  newPassword: string;
  rePassword: string;

  signature: Blob;
  src: string;

  error: string;

  get width() { return this.plt.width(); }

  @ViewChild('qrCanvas') qrCanvas: ElementRef<HTMLCanvasElement>;

  constructor(
    private plt: Platform,
    private auth: AuthService,
    private userService: UserService,
    private smartLogin: SmartLoginService,
    private img: ImageAndFileUploadService,
    private modal: ModalController,
    private popup: PopoverController,
    private loading: LoadingController,
    private injector: Injector) { }

  ngOnInit() {
    this.user = deepCopy(this.auth.currentUser);
    this.loadSignature();
  }

  password() {
    this.editPassword = true;
  }

  async loadSignature() {
    console.log(this.user);
    if (this.user.signature) {
      this.src = await GetDataUrlFromCall(this.img.getImageOrFile(this.user.signature));
    }
  }

  async chooseSignature() {
    const image = await this.img.selectPicture(CameraSource.Photos);
    if (!image) {
      return;
    }
    console.log(image);
    this.src = image.path;

    this.signature = image.data;
  }

  async createSignature() {
    const sig = await this.modal.create({ component: SignaturePadComponent });
    sig.present();
    const result = await sig.onWillDismiss();
    if (result.role === 'ok') {
      const data = result.data;
      let blob = await (await fetch(data)).blob()
      this.signature = blob;
      this.src = data;
    }
  }

  async updateProfile() {
    const call$ = this.userService.editUser(this.user, this.signature, true);
    addOrEdit(this.injector,
      {
        addOrEditCall: call$,
        stay: true,
        successTxt: 'User Profile Updated.',
        successCallback: data => {
          console.log(data);
          if (data?.signature) {
            this.user.signature = data.signature;
          }
          this.auth.setCurrentUser(this.user);
        },
        errorCallback: err => {
          console.log(err);
        }
      });
  }

  updatePassword() {
    this.error = null;
    if (!this.oldPassword) {
      this.error = 'Please enter the current password. (Old Password)';
      return;
    }
    if (!this.newPassword || !this.rePassword) {
      this.error = 'Please enter new password and re-enter the same password again.';
      return;
    }
    if (this.newPassword !== this.rePassword) {
      this.error = 'The password you entered are not matched.';
      return;
    }

    const call$ = this.userService.changePassword(this.user, this.oldPassword, this.newPassword);
    addOrEdit(this.injector,
      {
        addOrEditCall: call$,
        stay: true,
        successTxt: 'Password has been changed.',
        errorCallback: (err) => this.error = err,
        successCallback: () => {
          this.cancelPassword();
        },
        completeCallback: () => this.error = null
      });
  }

  cancelPassword() {
    this.editPassword = false;
    this.oldPassword = null;
    this.newPassword = null;
    this.rePassword = null;
    this.error = null;
  }

  smartLoginToken: string;
  qr: QRCode;
  
  async smartLoginGenerate() {
    const confirmPwd = await this.popup.create({
      component: PopupStringInputComponent,
      componentProps: {
        title: 'Please Confirm Password',
        color: false,
        isPassword: true
      }
    });

    confirmPwd.present();
    const result = await confirmPwd.onWillDismiss();
    if (result.role === 'ok') {
      const loader = await this.loading.create({
        backdropDismiss: false
      });
      loader.present();
      const pwd = result.data;
      this.smartLogin.generateToken(pwd)
        .pipe(finalize(() => loader.dismiss()))
        .subscribe({
          next: (res) => {
            this.smartLoginToken = res.token;
            const qr = this.qr = new QRCode();
            qr.setTypeNumber(10);
            qr.setErrorCorrectLevel(ErrorCorrectLevel.L);
            qr.addData( new QR8BitByte(`${SMART_LOGIN_PREFIX}:${this.smartLoginToken}`));
            qr.make();
            
            const toSvg = (qr: QRCode, border: number, lightColor: string, darkColor: string) => {
              if (border < 0)
                throw new RangeError("Border must be non-negative");
              let parts: Array<string> = [];
              const size = qr.getModuleCount();
              for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                  if (qr.isDark(x, y))
                    parts.push(`M${x + border},${y + border}h1v1h-1z`);
                }
              }
              return `<?xml version="1.0" encoding="UTF-8"?>
                      <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
                      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${size + border * 2} ${size + border * 2}" stroke="none">
                        <rect width="100%" height="100%" fill="${lightColor}"/>
                        <path d="${parts.join(" ")}" fill="${darkColor}"/>
                      </svg>
                      `
            }
            const toCanvas = (qr: QRCode, lightColor: string, darkColor: string, canvas: HTMLCanvasElement, cellSize = 2, margin = cellSize * 4) => {
              var size = qr.getModuleCount() * cellSize + margin * 2;
              canvas.width = size;
              canvas.height = size;
              var ctx = canvas.getContext('2d');

              // fill background
              ctx.fillStyle = lightColor;
              ctx.fillRect(0, 0, size, size);

              // draw cells
              ctx.fillStyle = darkColor;
              for (var row = 0; row < qr.getModuleCount(); row += 1) {
                for (var col = 0; col < qr.getModuleCount(); col += 1) {
                  if (qr.isDark(row, col) ) {
                    ctx.fillRect(
                      col * cellSize + margin,
                      row * cellSize + margin,
                      cellSize, cellSize);
                  }
                }
              }
            }
            setTimeout(() => {
              toCanvas(qr, '#FFF', '#000', this.qrCanvas.nativeElement, 4);
            }, 20);
            
          },
          error: (err) => {
            this.error = handleHttpError(err);
          }
        });
    }
  }

  downloadQR() {
    const url = this.qr.toDataURL(4);

    const img = new Image();
    img.addEventListener('load', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 250;
      canvas.height = 310;

      const context = canvas.getContext('2d');
      context.fillStyle = '#FFF';
      context.fillRect(0, 0, 250, 350);
      context.drawImage(img, 0, 0, 250, 250);
      context.font = '30px Calibri';
      context.fillStyle = '#000';
      context.fillText('HemoPro', 5, 270, 236);
      context.fillText(`User: ${this.auth.currentUser.userName}`, 5, 300, 236);


      URL.revokeObjectURL(url);

      // trigger a synthetic download operation with a temporary link
      const a = document.createElement('a');
      a.download = `smart-login-${this.auth.currentUser.userName}.png`;
      document.body.appendChild(a);
      a.href = canvas.toDataURL();
      a.click();
      a.remove();
    });
    img.src = url;
  }

  async revokeSmartLogin() {
    
    this.smartLogin.revoke().subscribe({
      next: () => {
        presentToast(this.injector, {
          header: 'Revoked',
          message: 'All any current smart login token has been revoked.'
        });
      },
      error: err => {
        console.log(err);
       this.error = handleHttpError(err);
      }
    });
  }

}
