import { DomSanitizer } from '@angular/platform-browser';
import { PageLoaderComponent } from './../../components/page-loader/page-loader.component';
import { Platform, NavController, ModalController, PopoverController } from '@ionic/angular';
import { NotificationService } from './../notification.service';
import { Notification } from './../notification';
import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, Injector } from '@angular/core';
import { from, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PageView } from '../../page-view';
import { NotificationBase } from '../notification-base';
import { RequestService } from '../../service/request.service';
import { ModalService } from '../../service/modal.service';

@Component({
  selector: 'app-notification-list-view',
  templateUrl: './notification-list-view.component.html',
  styleUrls: ['./notification-list-view.component.scss'],
})
export class NotificationListViewComponent extends NotificationBase implements OnInit, OnDestroy {
  
  interval: NodeJS.Timeout;
  private notiSub: Subscription;

  @ViewChild('loader') loader: PageLoaderComponent<PageView<Notification>>;

  constructor(
    private modalCtl: ModalController,
    popover: PopoverController,
    request: RequestService,
    noti: NotificationService,
    cdr: ChangeDetectorRef,
    plt: Platform,
    nav: NavController,
    modal: ModalService,
    injector: Injector,
    sanitizer: DomSanitizer) {
      super(popover, request, noti, cdr, plt, nav, modal, injector, sanitizer);
  }

  get loadNoti$() {
    return (page: number, limit: number) => {
      return from(this.noti.getAllNotification(page, limit));
    };
  }

  get width() { return this.plt.width(); }

  ngOnInit() {
    this.interval = setInterval(() => {
      this.cdr.markForCheck();
    } , 10000);

    this.notiSub = this.noti.onNotification.subscribe((newNoti) => {
      this.notifications.unshift(newNoti);
      this.cdr.detectChanges();
    });
  }

  async clearAll() {
    this.noti.clearAll(this.loader.limit);
    this.notifications = [];
  }

  async readAll(full: boolean = false) {
    if (full) {
      await this.noti.fetchAllRemaining(this.loader.limit);
      this.notifications = this.noti.notificationList;
    }
    await this.noti.setAsReadAndGroupAll(this.notifications);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    this.notiSub.unsubscribe();

    this.readAll(false);
  }

  close(): void {
    this.modalCtl.dismiss();
  }

}
