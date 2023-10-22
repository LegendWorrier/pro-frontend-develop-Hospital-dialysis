import { ControlHelperModule } from './../share/components/control-helper/control-helper.module';
import { TextBoxInputModule } from './components/text-box-input/text-box-input.module';
import { ShiftMainMenuComponent } from './components/shift-main-menu/shift-main-menu.component';
import { ShiftSelectComponent } from './components/shift-select/shift-select.component';
import { ShiftMenuComponent } from './components/shift-menu/shift-menu.component';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShiftsPage as ShiftsPage } from './shifts.page';

import { ShiftsPageRoutingModule } from './shifts-routing.module'
import { HeaderModule } from '../share/header/header.module';
import { UserInfoModule } from './components/user-info/user-info.module';
import { AppPipeModule } from "../pipes/app.pipe.module";
import { ScrollHideModule } from '../directive/scroll-hide.module';
import { UnitRoundLegendModule } from './components/unit-round-legend/unit-round-legend.module';
import { ShiftsTableModule } from './components/shifts-table/shifts-table.module';
import { SheetControlModule } from './components/sheet-control/sheet-control.module';

@NgModule({
    declarations: [
        ShiftsPage,
        ShiftMainMenuComponent,
        ShiftMenuComponent,
        ShiftSelectComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        RouterModule.forChild([{ path: '', component: ShiftsPage }]),
        ShiftsPageRoutingModule,
        HeaderModule,
        UserInfoModule,
        TextBoxInputModule,
        ControlHelperModule,
        UnitRoundLegendModule,
        ShiftsTableModule,
        SheetControlModule
    ]
})
export class ShiftsPageModule {}
