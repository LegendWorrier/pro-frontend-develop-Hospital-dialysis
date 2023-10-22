import { AppConfig } from './../../../app.config';
import { HttpErrorResponse } from '@angular/common/http';
import { GUID } from '../../../share/guid';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user';
import { UserService } from 'src/app/auth/user.service';
import { Entity } from 'src/app/share/audit';
import { getName, presentToast, ToastType, handleHttpError } from 'src/app/utils';
import { Feature } from 'src/app/enums/feature';

@Component({
  selector: 'app-cosign-request-popup',
  templateUrl: './cosign-request-popup.component.html',
  styleUrls: ['./cosign-request-popup.component.scss'],
})
export class CosignRequestPopupComponent implements OnInit {
  
  @Input() setCosignCall: (id: GUID | number, userId: GUID, password: string) => Observable<boolean>;
  @Input() resource: Entity;
  @Input() unitId: number;

  @Input() label?: string;

  @Input() requestCosignCall: (id: GUID | number, userId: GUID) => Observable<void>;

  userList: BehaviorSubject<User[]> = new BehaviorSubject<User[]>(null);

  getName = getName;

  userId: GUID;
  password: string;

  isAdmin: boolean = this.auth.currentUser.isAdmin;
  loading: boolean;

  enableRequest: boolean;

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private popCtl: PopoverController,
    private injector: Injector) { }

  ngOnInit() {
    if (!this.setCosignCall) {
      throw new Error("You must specify at least verify cosign call for the component first. See the code for more detail.");
    }
    this.userService.getAllUser()
      .subscribe(data => {
        this.userList.next(data.filter(x => 
          x.units.findIndex(x => x === this.unitId) > -1
          && !x.isPowerAdmin
          && (x.isNurse || x.isHeadNurse)
          && x.id !== this.auth.currentUser.id
          && x.id !== this.resource.createdBy
        ));
      });
    this.enableRequest = AppConfig.config.enableCosignRequest && Feature.hasFlag(this.auth.Feature, Feature.Integrated);
  }

  verifyAndSet() {
    this.loading = true;
    this.setCosignCall(this.resource.id, this.userId, this.password)
    .pipe(finalize(() => this.loading = false))
    .subscribe(
      {
        next: () => {
          presentToast(this.injector, {
            header: 'Requested',
            message: 'Proof Reader has been requested. (success)'
          });
          this.popCtl.dismiss(this.userId, 'OK');
        },
        error: (err) => {
          if (err.status === 403) {
            presentToast(this.injector, {
              header: 'Password Incorrect',
              message: 'The password is not correct.',
              type: ToastType.alert
            });
            return;
          }
          throw err;
        }
      }
    );
  }

  request() {
    this.loading = true;
    this.requestCosignCall(this.resource.id, this.userId)
    .pipe(finalize(() => this.loading = false))
    .subscribe(
      {
        next: () => {
          presentToast(this.injector, {
            header: 'Requested',
            message: 'Proof Reader has been requested. (success)'
          });
          this.popCtl.dismiss();
        },
        error: (err) => {
          if (err instanceof HttpErrorResponse) {
            handleHttpError(err);
            return;
          }
          throw err;
        }
      }
    );
  }

}
