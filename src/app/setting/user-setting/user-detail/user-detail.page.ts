import { ImageAndFileUploadService } from './../../../share/service/image-and-file-upload.service';
import { Unit } from './../../../masterdata/unit';
import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { IonContent, LoadingController, NavParams, AlertController, IonNav, Platform } from '@ionic/angular';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user';
import { UserService } from 'src/app/auth/user.service';
import { Roles } from 'src/app/enums/roles';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { handleHttpError, presentToast, onLeavePage, ToastType, checkGuidNullOrEmpty, pushOrModal } from 'src/app/utils';
import { DatanamePipe } from 'src/app/pipes/dataname.pipe';
import { CameraSource } from '@capacitor/camera';
import { guid } from 'src/app/share/guid';
import { Auth } from 'src/app/auth/auth-utils';
import { UserPermissionPage } from '../user-permission/user-permission.page';
import { ModalService } from 'src/app/share/service/modal.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.page.html',
  styleUrls: ['./user-detail.page.scss'],
})
export class UserDetailPage implements OnInit {
  @Input() user: User;
  @Input() addMode = false;

  @ViewChild(IonContent) content: IonContent;

  private original = new User();

  canEdit: boolean;
  canDelete: boolean;
  isPowerAdmin: boolean;
  editMode = false;

  src: string;
  signature: Blob;

  error: string;

  roleOptions: string[];
  unitList: Unit[];

  markForUpdate: boolean;

  get width() { return this.plt.width(); }

  statusList = [
    {name: 'Full Time', id: 'full' },
    {name: 'Part Time', id: 'part' }
  ];

  constructor(private auth: AuthService,
    private master: MasterdataService,
              private plt: Platform,
              private userService: UserService,
              private img: ImageAndFileUploadService,
              private loadingCtl: LoadingController,
              private alertCtl: AlertController,
              private injector: Injector,
              private modal: ModalService,
              private navParam: NavParams,
              private nav: IonNav)
    {
      this.isPowerAdmin = this.auth.currentUser.isPowerAdmin;
      this.master.getUnitList().subscribe(data => this.unitList = data);

    }

  ngOnInit() {
    if (!this.user) {
      this.user = new User();
    }

    this.canEdit = Auth.checkPermission(this.user, this.auth);
    this.canDelete = this.canEdit && !checkGuidNullOrEmpty(this.user.id);
    this.roleOptions = [Roles.Doctor, Roles.HeadNurse, Roles.Nurse, Roles.PN];

    this.loadSignature();
  }

  getUnit(id: number) {
    return this.unitList?.find(x => x.id === id)?.name || 'Undefined';
  }

  get inputMode() {
    return this.editMode || this.addMode;
  }

  get selectableUnits(): Unit[] {
    return this.isPowerAdmin ? this.unitList : this.unitList.filter(x => this.auth.currentUser.units.includes(x.id));
  }

  clear() {
    this.error = null;
    this.user = new User();
  }

  edit() {
    Object.assign(this.original, this.user);
    this.editMode = true;
  }

  cancel() {
    this.error = null;
    this.editMode = false;
    this.signature = null;
    if (!this.user.signature) {
      this.src = undefined;
    }
    Object.assign(this.user, this.original);
  }

  async chooseSignature() {
    if (!this.inputMode) {
      return;
    }
    const image = await this.img.selectPicture(CameraSource.Photos);
    if (!image) {
      return;
    }
    console.log(image);
    this.src = image.path;
    this.signature = image.data;
  }

  loadSignature() {
    if (this.user.signature) {
      this.img.getImageOrFile(this.user.signature)
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
  }

  onStatusChange(event){
    const status = event.detail.value;
    if (status == 'full') {
      this.user.isPartTime = false;
    }
    else if (status == 'part') {
      this.user.isPartTime = true;
    }
  }

  getCurrentStatus() {
    return this.user.isPartTime ? 'part' : 'full';
  }

  permission() {
    pushOrModal(UserPermissionPage, { user: this.user }, this.modal);
  }

  async save() {
    // safe-guard: check if this user is a unit's head nurse or not and prevent removing permission
    const headNurseUnits = this.unitList.filter(x => x.headNurse === this.user.id);
    if (headNurseUnits.find(x => !this.user.units.includes(x.id))) {
      const alert = await this.alertCtl.create({
        header: 'Change Prevention',
        subHeader: 'Cannot do this units change',
        message: `This user is a head nurse for unit(s): [${new DatanamePipe().transform(headNurseUnits.map(x => x.id), this.unitList)}].
          This user must have permission in those unit(s), unless you un-assign unit's head nurse from him/her first.`,
        buttons: [
          {
            text: 'Ok'
          }
        ]
      });
      alert.present();

      return;
    }

    this.addOrEdit(this.userService.editUser(this.user, this.signature));
  }

  async add() {
    this.addOrEdit(this.auth.register(this.user));
  }

  async addOrEdit(callToServer$: Observable<any>) {
    this.error = null;

    const loading = await this.loadingCtl.create();
    loading.present();

    callToServer$
    .pipe(finalize(() => loading.dismiss()))
    .subscribe({
      next: (data) => {
        console.log(data);
        presentToast(this.injector, { message: 'User info has been saved successfully' });
        if (data && typeof(data) === 'string') {
          console.log('fetch newly created user.');
          this.userService.getUser(guid(data)).subscribe(newUser => this.user = newUser);
          this.markForUpdate = this.addMode; // if not addmode, don't mark.
        }
      },
      error: (err) => {
        console.log(err);
        this.error = handleHttpError(err, this.content);
      },
      complete: () => {
        this.error = null;
        this.editMode = false;
        this.addMode = false;
      }
    });
  }

  async deleteUser() {
    const alert = await this.alertCtl.create({
      header: 'Confirmation',
      message: 'Are you sure you want to delete this user?\nThis action cannot be undone, this user will be erased permanently.',
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Confirm',
          role: 'OK'
        }
      ]
    });

    alert.present();
    const result = await alert.onWillDismiss();
    if (result.role !== 'OK') {
      return;
    }

    this.userService.deleteUser(this.user).subscribe(() => {
      presentToast(this.injector, { header: 'Deleted', message: 'The user has been deleted.', type: ToastType.alert });
      this.markForUpdate = true;
      this.user.id = undefined;
      this.nav.pop();
    });
  }

  ionViewWillLeave(){
    if (this.editMode) {
      this.cancel();
    }

    let data = null;
    if (this.markForUpdate) {
      data = this.user;
    }
    onLeavePage(data, this.navParam);
  }

}
