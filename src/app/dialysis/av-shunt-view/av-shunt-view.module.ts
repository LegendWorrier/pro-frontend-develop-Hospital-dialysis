import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AvShuntViewPageRoutingModule } from './av-shunt-view-routing.module';

import { AvShuntViewPage } from './av-shunt-view.page';
import { AvShuntListComponent } from './av-shunt-list/av-shunt-list.component';
import { AvShuntIssueComponent } from './av-shunt-issue/av-shunt-issue.component';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { SegmentTabsModule } from 'src/app/share/components/segment-tabs/segment-tabs.module';
import { EditAvShuntPageModule } from './edit-av-shunt/edit-av-shunt.module';
import { OptionListModule } from 'src/app/share/components/options-item/option-list.module';
import { AppPipeModule } from 'src/app/pipes/app.pipe.module';
import { ShowDeleteToggleModule } from 'src/app/share/components/show-delete-toggle/show-delete-toggle.module';
import { EditAvIssuePageModule } from './edit-av-issue/edit-av-issue.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AvShuntViewPageRoutingModule,
    HeaderThemeModule,
    SegmentTabsModule,
    OptionListModule,
    EditAvShuntPageModule,
    EditAvIssuePageModule,
    AppPipeModule,
    ShowDeleteToggleModule
  ],
  declarations: [AvShuntViewPage, AvShuntListComponent, AvShuntIssueComponent]
})
export class AvShuntViewPageModule {}
