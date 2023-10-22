import { DatetimeItemWrapperModule } from './datetime-item-wrapper/datetime-item-wrapper.module';
import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FilterListModule } from 'src/app/directive/filter-list/filter-list.module';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { BackButtonGroupComponent } from './back-button-group/back-button-group.component';
import { TagModule } from './tag/tag.module';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        HeaderThemeModule,
        TagModule,
        FilterListModule,
        DatetimeItemWrapperModule
    ],
    declarations: [
        BackButtonGroupComponent
    ],
    exports: [
        BackButtonGroupComponent
    ]
})
export class ShareComponentsModule {}
