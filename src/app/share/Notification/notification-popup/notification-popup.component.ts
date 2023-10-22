import { LanguageService } from './../../service/language.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { PopoverController, Platform, NavController } from '@ionic/angular';
import { NotificationListViewComponent } from './../notification-list-view/notification-list-view.component';
import { ModalService } from './../../service/modal.service';
import { environment } from './../../../../environments/environment';
import { NotificationService } from './../notification.service';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, Injector } from '@angular/core';
import { NotificationBase } from '../notification-base';
import { RequestService } from '../../service/request.service';

@Component({
  selector: 'app-notification-popup',
  templateUrl: './notification-popup.component.html',
  styleUrls: ['./notification-popup.component.scss'],
})
export class NotificationPopupComponent extends NotificationBase implements OnInit, OnDestroy {

  total: number = 0;
  debug = false;
  reset = false;

  moreCount: number = 0;

  get noShowAll() { return this.notifications.length === 0 || this.total <= 5; }

  private notiSub: Subscription;

  constructor(
    private lang: LanguageService,
    popup: PopoverController,
    request: RequestService,
    noti: NotificationService,
    cdr: ChangeDetectorRef,
    plt: Platform,
    nav: NavController,
    modal: ModalService,
    injector: Injector,
    sanitizer: DomSanitizer) {
      super(popup, request, noti, cdr, plt, nav, modal, injector, sanitizer);
  }

  async ngOnInit() {

    this.notiSub = this.noti.onNotification.subscribe((newNoti) => {
      this.notifications.unshift(newNoti);
      if (this.notifications.length > 5) {
        const last = this.notifications.pop();
        if (!last.isRead) {
          this.moreCount += 1;
        }
      }
      this.cdr.detectChanges();
    });

    this.debug = !environment.production;

    this.init();
    this.lang.OnLanguageChange.subscribe(() => this.init());
  }

  async init() {
    console.log('Notification popup init');
    const result = this.noti.getLatestNotification();
    this.notifications = result.data;
    this.total = result.total;

    console.log('total', this.total);
    this.moreCount = Math.max(0, (await this.noti.getUnreadCount()) - this.notifications.filter(x => !x.isRead).length);
  }

  showAll() {
    this.modal.openModal(NotificationListViewComponent, {});
    this.popup.dismiss();
  }

  async resetRead() {
    this.reset = true;
    await this.noti.resetReads();
  }

  ngOnDestroy(): void {
    this.notiSub.unsubscribe();
    if (!this.reset) {
      this.noti.setAsRead(this.notifications);
    }
  }

  
  close(): void {
    this.popup.dismiss();
  }

}
