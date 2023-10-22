import { Component, OnInit, Input, Injector } from '@angular/core';
import { AlertController, IonNav, NavParams } from '@ionic/angular';
import { RoleInfo } from 'src/app/auth/role-info';
import { PermissionGroupInfo, PermissionInfo, PermissionService } from 'src/app/share/service/permission.service';
import { ToastType, addOrEdit, deepCopy, onLeavePage, presentToast } from 'src/app/utils';

@Component({
  selector: 'app-role-detail',
  templateUrl: './role-detail.page.html',
  styleUrls: ['./role-detail.page.scss'],
})
export class RoleDetailPage implements OnInit {

  @Input() role: RoleInfo;
  tmp: RoleInfo;

  add: boolean = false;
  isBuiltIn: boolean = false;

  markForUpdate = false;
  error: string;

  constructor(
    private permissionService: PermissionService,
    private alertCtl: AlertController,
    private navParam: NavParams,
    private nav: IonNav,
    private injector: Injector) { }

  ngOnInit() {
    if (this.role) {
      this.tmp = deepCopy(this.role);
      this.isBuiltIn = this.role.name === 'Administrator';
    }
    else {
      this.tmp = { id: undefined, name: undefined, permissions: [] };
      this.add = true;
    }

    
  }

  save() {
    const call$ = this.add ? this.permissionService.addRole(this.tmp) : this.permissionService.editRole(this.tmp);

    addOrEdit(this.injector, {
      addOrEditCall: call$,
      successTxt: { name: 'Role', editMode: !this.add },
      isModal: true,
      successCallback: (data) => {
        if (data) {
          this.tmp = data;
        }
        this.permissionService.setTmp(this.tmp);
      },
      errorCallback: err => this.error = err
    })
  }

  async deleteRole() {
    let warning = `Are you sure to delete this role? [${this.role.name}]`;
    const alert = await this.alertCtl.create({
      backdropDismiss: true,
      header: 'Confirmation',
      message: warning,
      buttons: [
        {
          text: 'Cancel'
        }, {
          text: 'Ok',
          handler: () => {
            console.log('Confirm Ok');
            
            // delete
            this.permissionService.deleteRole(this.role)
            .subscribe(() => {
              presentToast(this.injector, {
                header: 'Deleted',
                message: `Role deleted`,
                type: ToastType.alert
              });
              this.markForUpdate = true;
              this.tmp.id = undefined;
              this.nav.pop();
            });
          }
        }
      ]
    });
    alert.present();
  }

  ionViewWillLeave() {
    let passing = null;
    if (this.markForUpdate) {
      passing = this.tmp;
    }
    onLeavePage(passing, this.navParam);
  }

}
