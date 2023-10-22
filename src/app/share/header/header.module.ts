import { PageLoaderModule } from './../components/page-loader/page-loader.module';
import { NotificationListViewComponent } from './../Notification/notification-list-view/notification-list-view.component';
import { NotificationPopupComponent } from './../Notification/notification-popup/notification-popup.component';
import { ScrollHideModule } from './../../directive/scroll-hide.module';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HeaderComponent } from './header.component';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { ShareComponentsModule } from '../components/share-components.module';
import { ApprovalReviewComponent } from '../Notification/approval-review/approval-review.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HeaderThemeModule,
    ShareComponentsModule,
    ScrollHideModule,
    PageLoaderModule
  ],
  declarations: [HeaderComponent, NotificationPopupComponent, NotificationListViewComponent, ApprovalReviewComponent],
  exports: [HeaderComponent, NotificationPopupComponent, NotificationListViewComponent, ApprovalReviewComponent]
})
export class HeaderModule {}
