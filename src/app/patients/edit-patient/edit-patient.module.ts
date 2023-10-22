import { IdentityValidatorModule } from './../../identity-validator.module';
import { DatetimeItemWrapperModule } from './../../share/components/datetime-item-wrapper/datetime-item-wrapper.module';
import { PopupStringInputModule } from './../../share/components/popup-string-input/popup-string-input.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditPatientPageRoutingModule } from './edit-patient-routing.module';

import { EditPatientPage } from './edit-patient.page';
import { HeaderModule } from 'src/app/share/header/header.module';
import { AppPipeModule } from 'src/app/pipes/app.pipe.module';
import { TagDetailComponent } from '../tag-detail/tag-detail.component';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { TagModule } from 'src/app/share/components/tag/tag.module';
import { FilterListModule } from 'src/app/directive/filter-list/filter-list.module';
import { SelectAsyncListModule } from 'src/app/share/components/select-async-list/select-async-list.module';
import { BrMaskModule } from 'src/app/directive/br-mask.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditPatientPageRoutingModule,
    HeaderModule,
    AppPipeModule,
    HeaderThemeModule,
    TagModule,
    FilterListModule,
    SelectAsyncListModule,
    PopupStringInputModule,
    DatetimeItemWrapperModule,
    IdentityValidatorModule,
    BrMaskModule
  ],
  declarations: [EditPatientPage, TagDetailComponent]
})
export class EditPatientPageModule {}
