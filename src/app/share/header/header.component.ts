import { NotificationPopupComponent } from './../Notification/notification-popup/notification-popup.component';
import { Component, EventEmitter, Input, OnInit, Output, Renderer2, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { IonContent, IonToolbar, NavController, PopoverController } from '@ionic/angular';
import { ScrollHideConfig } from 'src/app/directive/scroll-hide.directive';
import { NotificationService } from '../Notification/notification.service';
import { Header } from './header';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() pageName: string;
  @Input() content: IonContent;
  @Input() searchBar: boolean = true;
  @Input() back: boolean = true;
  @Input() prev: string;
  @Input() placeholder: string;

  @Input() icon: string;
  @Input() showMenuBtn: boolean = false;

  @Output() onSearch: EventEmitter<string> = new EventEmitter<string>();
  @Output() onClear: EventEmitter<void> = new EventEmitter();

  headerScrollConfig: ScrollHideConfig = { cssProperty: 'margin-top', maxValue: 52, inverse: false };

  unreadNoti: number;

  @ViewChildren(IonToolbar) toolbars: IonToolbar[];

  get searchPlacehodler() {
    return this.placeholder ? this.placeholder : 'Search';
  }

  constructor(
    private renderer: Renderer2,
    private nav: NavController,
    private popup: PopoverController,
    private noti: NotificationService,
    private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    if (this.searchBar) {
      this.renderer.addClass((this.content as any).el, 'paddingHeader');
    }
    
    this.noti.afterInit.subscribe(async () => {
      this.unreadNoti = await this.noti.getUnreadCount() ?? 0;
      console.log('unread: ', this.unreadNoti);
    });
    this.noti.onRead.subscribe(unreadCount => {
      this.unreadNoti = unreadCount;
    });
    this.noti.onNotification.subscribe(() => {
      this.unreadNoti += 1;
      this.cdr.detectChanges();
    });

    Header.initPrevPage = this.prev;
  }

  profile() {
    this.nav.navigateForward('/profile');
  }

  onSearchEvent(e) {
    const v = e.detail.value;
    console.log("search: " + v);
    this.onSearch.emit(v);
  }

  onClearEvent() {
    console.log("clear search box.");
    this.onClear.emit();
  }

  async showNoti(event) {
    const notiPopup = await this.popup.create({
      component: NotificationPopupComponent,
      event,
      showBackdrop: false,
      cssClass: 'noti-popup'
    });

    notiPopup.present();
  }

}
