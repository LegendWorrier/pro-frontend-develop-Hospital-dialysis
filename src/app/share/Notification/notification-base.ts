import { addOrEdit, presentToast, ToastType } from 'src/app/utils';
import { RequestService } from './../service/request.service';
import { GUID } from './../guid';
import { ChangeDetectorRef, Injector } from '@angular/core';
import { Platform, NavController, PopoverController } from '@ionic/angular';
import { formatDistanceToNow, isPast } from 'date-fns';
import { NotificationService } from './notification.service';
import { Notification } from './notification';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApprovalReviewComponent } from './approval-review/approval-review.component';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ModalService } from '../service/modal.service';
import { HemosheetViewPage } from 'src/app/dialysis/hemosheet-view/hemosheet-view.page';


export abstract class NotificationBase {

  notifications: Notification[] = [];

  constructor(
    protected popup: PopoverController,
    protected request: RequestService,
    protected noti: NotificationService,
    protected cdr: ChangeDetectorRef,
    protected plt: Platform,
    protected nav: NavController,
    protected modal: ModalService,
    protected injector: Injector,
    private sanitizer: DomSanitizer) { }

    getSanitizedDetail(item: Notification): SafeHtml {
      return this.sanitizer.bypassSecurityTrustHtml(item.Detail);
    }
    
    getCreateLabel(value: Date | string) {
      return formatDistanceToNow(new Date(value), { addSuffix: true });
    }
  
    isExpired(item: Notification) {
      return isPast(new Date(item.ExpireDate));
    }

    canAction(item: Notification) {
      return item.Action.length > 0 && item.Action[0].length > 0 && !this.isExpired(item)
              && !(this.isApproved(item) || this.isDenied(item) || this.isInvalid(item));
    }

    isApproved(item: Notification) {
      return item.Tags.includes('approved');
    }

    isDenied(item: Notification) {
      return item.Tags.includes('denied');
    }

    isInvalid(item: Notification) {
      return item.Tags.includes('invalid');
    }

    notiAction(item: Notification) {
      if (!item.Action || item.Action.length === 0) {
        return;
      }

      switch (item.Action[0]) {
        case 'page':
          switch (item.Action[1]) {
            case 'patient':
              // page/patient/[id]/[optional] => med, pres
              this.gotoPatient(item.Action[2], item.Action[3]);
              break;
            case 'monitor':
              this.gotoMonitor();
              break;
            case 'schedule':
              this.gotoSchedule();
              break;

            default:
              break;
          }
          break;
        case 'modal':
          switch(item.Action[1]) {
            case 'hemosheet':
              const params = {};
              const id = item.Action[2] as GUID;
              const optionalArg = item.Action[3];
              if (optionalArg) {
                params['cmd'] = [ optionalArg ];
                (params['cmd'] as string[]).push(...item.Tags);
              }
              params['hemosheetId'] = id;
              this.openModal(HemosheetViewPage, params);
              break;
            default:
              break;
          }
          break;
        case 'approve':
          this.approveReview(item.Action[1] as GUID);
          break;
        
        default:
          break;
      }
    }

    abstract close(): void;

    gotoPatient(patientId: string, optionalArg?: string) {
      console.log('go to patient');

      const params = {};
      if (optionalArg) {
        params[optionalArg] = true;
      }

      this.nav.navigateForward(['patients', patientId], { queryParams: { ...params } });
      this.close();

      if (optionalArg && window.location.pathname.startsWith('/patient')) {
        this.noti.SignalAction({
          target: 'patient',
          params: { id: patientId, ...params }
        });
      }

    }

    gotoMonitor() {
      this.nav.navigateForward(['monitor']);
      this.close();
    }

    gotoSchedule() {
      this.nav.navigateForward(['schedule']);
      this.close();
    }

    openModal(component: any, params: { [key: string]: any }) {
      this.modal.openModal(component, params);
    }

    async approveReview(id: GUID) {
      const info = await firstValueFrom(this.request.requestInfo(id));
      if (!info) {
        presentToast(this.injector, {
          header: 'Error',
          message: 'The request no longer exists.',
          type: ToastType.alert
        });
        return;
      }
      const window = await this.popup.create({
        component: ApprovalReviewComponent,
        componentProps: { requestInfo: info },
        alignment: 'center',
        cssClass: 'hemo-popup'
      })
      window.present();

      const result = await window.onWillDismiss();
      if (result.role === 'ok') {
        const approved = result.data;
        let call$;
        if (approved) {
          call$ = this.request.approveRequest(id);
        }
        else {
          call$ = this.request.denyRequest(id);
        }
        addOrEdit(this.injector, {
          addOrEditCall: call$,
          successTxt: `The request has been replied with '${approved ? 'Approved' : 'Rejected' }'`,
          isModal: true,
          stay: true,
          successCallback: (result) => {
            console.log(result);
            if (result) {
              this.notifications.find(x => x.Id === info.notificationId).Tags.push(result);
            }
          },
          customErrorHandling: (err) => {
            if (err instanceof HttpErrorResponse && err.status !== 401) {
              this.notifications.find(x => x.Id === info.notificationId).Tags.push('invalid');
            }

            return false;
          }
        });
        this.close();
      }
    }
}